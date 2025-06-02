import dbConnect from '../../utils/db'
import User from '../../models/User'

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: "Email & password wajib diisi" });

  await dbConnect();
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "User tidak ditemukan" });

  // Ganti sesuai hash password production (pakai bcrypt), ini contoh simple:
  if (user.password !== password) {
    return res.status(400).json({ message: "Password salah" });
  }

  res.status(200).json({
    email: user.email,
    name: user.name || user.email,
    status_pembayaran: user.status_pembayaran || "pending",
  });
}
