// pages/api/onboarding/finish.js

import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import Order from "@/models/Order";
import Package from "@/models/Package";
import { getServerSession } from "next-auth";
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { v4 as uuidv4 } from 'uuid';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ message: "Unauthorized" });

  await dbConnect();
  const user = await User.findOne({ email: session.user.email });
  if (!user) return res.status(404).json({ message: "User not found" });

  const paket = await Package.findById(user.currentPackage?.packageId);
  if (!paket) return res.status(400).json({ message: "Paket tidak ditemukan" });

  // 1. Create Xendit Invoice
  const XENDIT_SECRET_KEY = process.env.XENDIT_SECRET_KEY;
  const body = {
    external_id: `order-${uuidv4()}`,
    payer_email: user.email,
    description: `Pembelian Paket ${paket.name}`,
    amount: paket.price,
    invoice_duration: 86400, // 24 jam
    success_redirect_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard`
  };

  const response = await fetch("https://api.xendit.co/v2/invoices", {
    method: "POST",
    headers: {
      Authorization: "Basic " + Buffer.from(XENDIT_SECRET_KEY + ":").toString("base64"),
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  const invoice = await response.json();
  if (!invoice.id) {
    return res.status(500).json({ message: "Gagal membuat invoice Xendit", error: invoice });
  }

  // 2. Simpan order ke database
  const newOrder = await Order.create({
    userId: user._id,
    packageId: paket._id,
    xenditInvoiceId: invoice.id,
    invoiceUrl: invoice.invoice_url,
    amount: paket.price
  });

  // 3. Update user status
  user.hasCompletedOnboarding = true;
  await user.save();

  return res.status(200).json({
    redirectUrl: invoice.invoice_url
  });
}
