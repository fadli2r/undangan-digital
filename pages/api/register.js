import dbConnect from "@/utils/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, message: "Method not allowed" });
  }

  try {
    await dbConnect();

    const { email, password, name, phone } = req.body;

    // 🧠 Validasi input
    if (!email || !password || !name || !phone) {
      return res.status(400).json({
        ok: false,
        message: "Nama, email, nomor HP, dan password wajib diisi.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        ok: false,
        message: "Password minimal 6 karakter.",
      });
    }

    const phoneRegex = /^[0-9]{9,15}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({
        ok: false,
        message: "Nomor HP tidak valid (hanya angka, 9–15 digit).",
      });
    }

    // 🔍 Cek email sudah terdaftar
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        ok: false,
        message: "Email sudah terdaftar.",
      });
    }

    // 🔐 Hash password sebelum simpan
    const hashedPassword = await bcrypt.hash(password, 12);

    // 🧩 Simpan user baru
    const newUser = await User.create({
      name,
      email: email.toLowerCase(),
      phone,
      password: hashedPassword,
            isActive: true,                 // ✅ penting agar authorize() bisa nemu user

      role: "user",
      isOAuthUser: false,
    });

    // 🚫 Jangan kirim password ke client
    const userResponse = newUser.toObject();
    delete userResponse.password;

    return res.status(201).json({
      ok: true,
      message: "Berhasil daftar.",
      user: userResponse,
    });
  } catch (error) {
    console.error("❌ Registration error:", error);
    return res.status(500).json({
      ok: false,
      message: "Terjadi kesalahan server.",
      error: error.message,
    });
  }
}
