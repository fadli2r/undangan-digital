// pages/api/invitation/update-slug.js
import dbConnect from "../../../lib/dbConnect";
import Invitation from "../../../models/Invitation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

function normalizeSlug(s = "") {
  return s
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

const RESERVED = new Set([
  "api","_next","static","assets","public","favicon.ico",
  "dashboard","login","logout","support-center","paket","edit-undangan",
  "buat-undangan-metronic","onboarding","admin","undangan",
  "ticket","blog","pricing","terms","privacy"
]);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.email) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    await dbConnect();

    const { id, currentSlug, newSlug } = req.body || {};
    if (!newSlug || (!id && !currentSlug)) {
      return res.status(400).json({ message: "Data tidak lengkap" });
    }

    // Normalisasi & validasi slug baru
    const normalized = normalizeSlug(newSlug);
    if (!normalized || normalized.length < 3 || normalized.length > 60) {
      return res.status(422).json({
        message: "Format link tidak valid. Panjang 3–60, hanya huruf/angka/tanda minus (-).",
      });
    }
    if (RESERVED.has(normalized)) {
      return res.status(409).json({ message: "Link ini dibatasi sistem. Silakan gunakan nama lain." });
    }

    // Ambil undangan milik user (by id ATAU slug saat ini)
    let invitation = null;
    if (id) {
      invitation = await Invitation.findOne({ _id: id, user_email: session.user.email });
    } else {
      invitation = await Invitation.findOne({
        user_email: session.user.email,
        $or: [{ slug: currentSlug }, { custom_slug: currentSlug }],
      });
    }

    if (!invitation) {
      return res.status(404).json({ message: "Undangan tidak ditemukan" });
    }

    // Jika tidak ada perubahan dibanding slug utama
    if (normalized === invitation.slug) {
      return res.status(200).json({ ok: true, message: "Tidak ada perubahan", slug: normalized });
    }

    // Cek konflik: ada undangan lain pakai slug tsb (cek slug & custom_slug untuk aman)
    const conflict = await Invitation.findOne({
      _id: { $ne: invitation._id },
      $or: [{ slug: normalized }, { custom_slug: normalized }],
    }).select("_id");

    if (conflict) {
      return res.status(409).json({ message: "Link sudah digunakan" });
    }

    // Update slug utama; (opsional) kosongkan custom_slug lama agar konsisten
    invitation.slug = normalized;
    if (invitation.custom_slug) {
      invitation.custom_slug = undefined; // jika field optional/sparse
    }
    await invitation.save();

    return res.status(200).json({
      ok: true,
      message: "Link berhasil diupdate",
      slug: normalized,
    });
  } catch (error) {
    console.error("Error updating slug:", error);
    return res.status(500).json({
      message: "Terjadi kesalahan server",
      error: "INTERNAL_SERVER_ERROR",
    });
  }
}
