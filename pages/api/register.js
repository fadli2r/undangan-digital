import dbConnect from '../../utils/db'
import User from '../../models/User'

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  await dbConnect();
  const { email, password, name } = req.body;
  // Cek user sudah ada
  const exist = await User.findOne({ email });
  if (exist) return res.status(400).json({ message: "Email sudah terdaftar" });

  // NB: Untuk produksi, hash password pakai bcrypt!
  const user = await User.create({ email, password, name });
  return res.status(201).json({ message: "Berhasil daftar", user });
}
