// pages/api/features/available.js
import dbConnect from "@/lib/dbConnect";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import Invitation from "@/models/Invitation";
import Feature from "@/models/Feature";

/**
 * Membersihkan dan membuat array string menjadi unik, lowercase, dan tanpa spasi.
 * @param {string[]} arr - Array of strings
 * @returns {string[]}
 */
const toKeys = (arr) =>
  Array.from(
    new Set(
      (Array.isArray(arr) ? arr : [])
        .map((k) => String(k || "").toLowerCase().trim())
        .filter(Boolean)
    )
  );

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.email) {
      return res.status(401).json({ message: "Unauthorized. Silakan login kembali." });
    }

    const { slug } = req.query;
    if (!slug || typeof slug !== 'string') {
      return res.status(400).json({ message: "Parameter 'slug' diperlukan." });
    }

    await dbConnect();

    // 1. Temukan undangan berdasarkan slug dan kepemilikan user
    //    dan ambil detail paketnya (populate)
    const invitation = await Invitation.findOne({
      user_email: session.user.email,
      slug: slug.toLowerCase().trim(),
    })
      .populate("packageId", "name type featureKeys selectableFeatures")
      .lean();

    if (!invitation) {
      return res.status(404).json({ message: "Undangan tidak ditemukan atau Anda tidak memiliki akses." });
    }

    const pkg = invitation.packageId || null;
    if (!pkg) {
      return res.status(404).json({ message: "Paket untuk undangan ini tidak ditemukan." });
    }

    // 2. Tentukan fitur yang sudah aktif
    //    Gabungan dari fitur bawaan paket (featureKeys) dan fitur tambahan (allowedFeatures)
    const activeFeatures = toKeys([
      ...(pkg.featureKeys || []),
      ...(invitation.allowedFeatures || []),
    ]);

    // 3. Tentukan fitur yang bisa dipilih/dibeli dari paket ini (selectableFeatures)
    const selectableFeatures = toKeys(pkg.selectableFeatures || []);

    // 4. Buat daftar kandidat fitur untuk di-upgrade
    //    Yaitu fitur yang bisa dipilih TETAPI belum aktif
    const candidateKeys = selectableFeatures.filter((key) => !activeFeatures.includes(key));

    // Jika tidak ada kandidat, langsung kembalikan array kosong
    if (candidateKeys.length === 0) {
      return res.status(200).json({
        active: activeFeatures,
        available: [], // Tidak ada fitur tersedia untuk di-upgrade
      });
    }

    // 5. Ambil detail (nama, harga, dll.) dari fitur-fitur kandidat
    const availableFeatures = await Feature.find({
      key: { $in: candidateKeys },
      active: true, // Pastikan hanya fitur yang aktif secara global yang ditawarkan
    })
      .select("key name price description")
      .lean();

    return res.status(200).json({
      active: activeFeatures,
      available: availableFeatures.map((f) => ({
        key: f.key,
        name: f.name || f.key,
        price: Number(f.price || 0),
        description: f.description || "",
      })),
    });

  } catch (e) {
    console.error("[API: features/available] Error:", e);
    return res.status(500).json({ message: "Terjadi kesalahan pada server." });
  }
}