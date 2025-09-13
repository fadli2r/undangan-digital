import dbConnect from '../../utils/db';
import User from '../../models/User';

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  try {
    await dbConnect();

    const { email, password, name, phone } = req.body;

    // Validasi input dasar
    if (!email || !password || !name || !phone) {
      return res.status(400).json({
        message: "Nama, email, nomor HP, dan password wajib diisi",
      });
    }

    // Validasi panjang password
    if (password.length < 6) {
      return res.status(400).json({
        message: "Password minimal 6 karakter",
      });
    }

    // Validasi nomor HP (angka + minimal panjang)
    const phoneRegex = /^[0-9]{9,15}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({
        message: "Nomor HP tidak valid (hanya angka, 9-15 digit)",
      });
    }

    // Cek jika email sudah terdaftar
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        message: "Email sudah terdaftar",
      });
    }

    // Simpan user baru
    const newUser = await User.create({
      name,
      email: email.toLowerCase(),
      phone,
      password, // diasumsikan akan di-hash oleh middleware mongoose
      isOAuthUser: false,
    });

    // Hapus password dari response
    const userResponse = newUser.toObject();
    delete userResponse.password;

    return res.status(201).json({
      message: "Berhasil daftar",
      user: userResponse,
    });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({
      message: "Terjadi kesalahan server",
    });
  }
}
