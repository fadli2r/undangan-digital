import dbConnect from '../../utils/db';
import User from '../../models/User';
import Order from '../../models/Order';

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  await dbConnect();

  const { email, status } = req.body;
  if (!email || !status) return res.status(400).json({ message: "Email dan status wajib diisi" });

  // Update status pembayaran
  await User.updateOne({ email }, { status_pembayaran: status });

  if (status === "paid") {
    // Tambah quota user
    await User.updateOne({ email }, { $inc: { quota: 1 } });

    // Tambahkan order baru
    await Order.create({
      email,
      paket: "Basic",
      harga: 25000,
      status: "paid",
      date: new Date(),
      used: false,
      invitation_slug: null
    });
  }

  res.status(200).json({ message: "Status pembayaran, quota, dan order berhasil diupdate." });
}
