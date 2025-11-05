// pages/api/invitation/rsvp.js
import dbConnect from "../../../utils/db";
import Invitation from "../../../models/Invitation";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { slug, nama, kehadiran, jumlah_tamu, pesan } = req.body || {};

    // 🔹 Validasi dasar
    if (!slug || !nama || !kehadiran) {
      return res.status(400).json({ message: "Data tidak lengkap" });
    }

    const jumlah = Number.isFinite(Number(jumlah_tamu))
      ? Math.max(1, Math.min(5, Number(jumlah_tamu)))
      : 1;

    await dbConnect();
    const invitation = await Invitation.findOne({ slug });
    if (!invitation) {
      return res.status(404).json({ message: "Undangan tidak ditemukan" });
    }

    const now = new Date();
    const norm = (s) => String(s || "").trim().toLowerCase();

    // ===============================
    // 🔹 1. Sinkronisasi ke daftar tamu
    // ===============================
    invitation.tamu = Array.isArray(invitation.tamu) ? invitation.tamu : [];
    const idx = invitation.tamu.findIndex((t) => norm(t.nama) === norm(nama));

    if (idx !== -1) {
      // update tamu existing
      invitation.tamu[idx].status_rsvp = kehadiran;   // "hadir" | "tidak_hadir" | "ragu"
      invitation.tamu[idx].jumlah_rsvp = jumlah;
      invitation.tamu[idx].pesan_rsvp = pesan || "";
      invitation.tamu[idx].waktu_rsvp = now;
    } else {
      // jika nama tidak ada → tambahkan baru
      invitation.tamu.push({
        nama,
        kontak: "",
        status_rsvp: kehadiran,
        jumlah_rsvp: jumlah,
        pesan_rsvp: pesan || "",
        waktu_rsvp: now,
      });
    }

    // ===============================
    // 🔹 2. Simpan ke log RSVP (riwayat)
    // ===============================
    invitation.rsvp = Array.isArray(invitation.rsvp) ? invitation.rsvp : [];
    invitation.rsvp.push({
      nama,
      status: kehadiran,
      jumlah,
      pesan: pesan || "",
      waktu: now,
    });

    await invitation.save();

    return res.status(200).json({
      success: true,
      message: "✅ RSVP berhasil dicatat & disinkronkan ke daftar tamu",
    });
  } catch (error) {
    console.error("RSVP Error:", error);
    return res.status(500).json({ message: "Terjadi kesalahan server" });
  }
}
