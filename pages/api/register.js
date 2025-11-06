// pages/api/register.js
import dbConnect from "@/utils/db";
import User from "@/models/User";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, message: "Method not allowed" });
  }

  try {
    await dbConnect();

    const { email, password, name, phone } = req.body || {};

    // --- Normalisasi dasar ---
    const normEmail = String(email || "").trim().toLowerCase();
    const normName = String(name || "").trim();
    const normPhone = String(phone || "").replace(/[^\d]/g, ""); // angka saja

    // --- Validasi ---
    if (!normEmail || !password || !normName || !normPhone) {
      return res.status(400).json({
        ok: false,
        message: "Nama, email, nomor HP, dan password wajib diisi.",
      });
    }

    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normEmail);
    if (!emailOk) {
      return res.status(400).json({ ok: false, message: "Format email tidak valid." });
    }

    if (password.length < 6) {
      return res.status(400).json({
        ok: false,
        message: "Password minimal 6 karakter.",
      });
    }

    if (!/^\d{9,15}$/.test(normPhone)) {
      return res.status(400).json({
        ok: false,
        message: "Nomor HP tidak valid (hanya angka, 9–15 digit).",
      });
    }

    // --- Cek duplikasi ---
    const existing = await User.findOne({ email: normEmail });
    if (existing) {
      return res.status(400).json({ ok: false, message: "Email sudah terdaftar." });
    }

    // --- Create user (❗tanpa hash manual; model yang hash di pre('save')) ---
    const newUser = await User.create({
      name: normName,
      email: normEmail,
      phone: normPhone,
      password,            // biarkan model yang meng-hash
      isActive: true,
      role: "user",
      isOAuthUser: false,
      onboardingCompleted: false,
      onboardingStep: 1,
      quota: 0,
      source: "website",
    });

    // model sudah hide password via transform
    const safeUser = newUser.toObject();

    return res.status(201).json({
      ok: true,
      message: "Berhasil daftar.",
      user: safeUser,
    });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(400).json({ ok: false, message: "Email sudah terdaftar." });
    }
    console.error("❌ Registration error:", error);
    return res.status(500).json({
      ok: false,
      message: "Terjadi kesalahan server.",
    });
  }
}
