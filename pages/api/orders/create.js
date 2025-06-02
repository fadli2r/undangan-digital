// /pages/api/orders/create.js
import dbConnect from '../../utils/db';
import Order from '../../models/Order';
import User from '../../models/User';

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  await dbConnect();

  const { email, paket, harga, invoice_id } = req.body;
  if (!email) return res.status(400).json({ message: "No email" });

  // Buat order baru
  const order = await Order.create({
    email,
    paket,
    harga,
    status: "paid", // atau sesuai webhook
    invoice_id,
    date: new Date(),
    used: false,
    invitation_slug: null
  });

  // Tambahkan quota user
  await User.updateOne({ email }, { $inc: { quota: 1 } });

  res.status(200).json({ order });
}
