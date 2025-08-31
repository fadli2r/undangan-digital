// pages/api/payment/create-invoice.js
import axios from "axios";
// ⚠️ Pakai helper DB yang sama dengan API lain (ganti ke utils/db kalau itu yang kamu pakai di seluruh project)
import dbConnect from '../../../lib/dbConnect';
import mongoose from "mongoose";
import User from "../../../models/User";
import Order from "../../../models/Order";
import Package from "../../../models/Package";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });

  const {
    packageId,      // ⬅️ rekomendasi
    paket,          // fallback: bisa ObjectId/slug/name
    email,
    name,
    onboardingData, // { pria, wanita, ... }
    successUrl,
    failureUrl,
  } = req.body || {};

  if (!email) return res.status(400).json({ message: "Email tidak ditemukan" });

  await dbConnect();

  // Resolve package
  let pkg = null;

  const tryFindById = async (id) => {
    if (typeof id !== "string") return null;
    if (!mongoose.isValidObjectId(id)) return null;
    return Package.findById(id).lean();
  };

  if (packageId) {
    pkg = await tryFindById(packageId);
  }
  if (!pkg && paket) {
    // 1) coba sebagai ObjectId
    pkg = await tryFindById(paket);
    // 2) coba slug
    if (!pkg) pkg = await Package.findOne({ slug: paket }).lean();
    // 3) coba name
    if (!pkg) pkg = await Package.findOne({ name: paket }).lean();
  }

  if (!pkg) {
    return res.status(404).json({ message: "Package not found", debug: { packageId, paket } });
  }

  // Hitung total
  const basePrice = Number(pkg.price || 0);
  const data = onboardingData || {};
  const addDomain = data.useCustomDomain ? 300000 : 0;
  const addDonasi = data.oneTree ? 10000 : 0;
  const amount = basePrice + addDomain + addDonasi;
  if (!(amount > 0)) return res.status(400).json({ message: "Nominal pembayaran tidak valid" });

  // Buat Order pending
  const external_id = `order_${email}_${Date.now()}`;
  const notesObj = {
    packageId: pkg._id?.toString(),
    packageName: pkg.name,
    basePrice,
    addDomain,
    addDonasi,
    data,
  };

  const order = await Order.create({
    email,
    packageId: pkg._id,
    harga: amount,
    status: "pending",
    external_id,
    notes: JSON.stringify(notesObj),
    created_at: new Date(),
  });

  // Panggil Xendit
  const apiKey = process.env.XENDIT_SECRET_KEY || process.env.XENDIT_API_KEY;
  if (!apiKey) return res.status(500).json({ message: "XENDIT_SECRET_KEY / XENDIT_API_KEY belum di-set" });

  const APP_URL = process.env.APP_URL;

  try {
    const resp = await axios.post(
      "https://api.xendit.co/v2/invoices",
      {
        external_id,
        amount,
        payer_email: email,
        description: `Pembelian Paket Undangan: ${pkg.name}`,
        currency: "IDR",
        success_redirect_url: successUrl || `${APP_URL}/onboarding/finish`,
        failure_redirect_url: failureUrl || `${APP_URL}/onboarding/summary`,
      },
      { auth: { username: apiKey, password: "" } }
    );

    order.invoice_id = resp.data?.id;
    order.invoice_url = resp.data?.invoice_url;
    await order.save();

    await User.findOneAndUpdate(
      { email },
      { $set: { name: name || "", status_pembayaran: "pending" } },
      { upsert: true, new: true }
    );

    return res.status(200).json({ invoice_url: resp.data?.invoice_url, invoice_id: resp.data?.id });
  } catch (error) {
    console.error("Xendit create invoice error:", error?.response?.data || error.message);
    try { order.status = "cancelled"; await order.save(); } catch {}
    // Provide more detailed error information
    const errorMessage = error?.response?.data?.message || error?.message || "Gagal membuat invoice";
    return res.status(500).json({ 
      message: "Gagal membuat invoice", 
      error: errorMessage,
      details: error?.response?.data || null
    });
  }
}
