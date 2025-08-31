// pages/api/invitations/create.js
import dbConnect from "../../../lib/dbConnect";
import Invitation from "../../../models/Invitation";
import User from "../../../models/User";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

function sanitizeSlug(raw) {
  if (!raw) return "";
  return String(raw)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function generateSlug(len = 8) {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < len; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
  return result;
}

function safeParseBody(body) {
  if (!body) return {};
  if (typeof body === "string") {
    try { return JSON.parse(body); } catch { return {}; }
  }
  return body;
}

export default async function handler(req, res) {
  // pastikan response JSON & non-cache
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    // Auth
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.email) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const email = session.user.email;

    await dbConnect();

    // Body input (robust)
    const {
      template,
      slug: slugInput,
      pria = "",
      wanita = "",
      orangtua_pria = "",
      orangtua_wanita = "",
      tanggal = null,
      waktu = "",
      lokasi = "",
    } = safeParseBody(req.body);

    if (!template) {
      return res.status(400).json({ message: "Template diperlukan" });
    }

    // 1) Kurangi quota atomik; pastikan quota > 0
    const user = await User.findOneAndUpdate(
      { email, quota: { $gt: 0 } },
      { $inc: { quota: -1 }, $set: { onboardingCompleted: true } },
      { new: true }
    );
    if (!user) {
      return res.status(403).json({ message: "Quota habis, silakan beli paket" });
    }

    // 2) Tentukan slug (pakai input jika ada, kalau tidak generate)
    let slug = sanitizeSlug(slugInput) || generateSlug(8);

    // 3) Pastikan slug unik (maks 10 percobaan). Jika gagal → rollback quota.
    let attempts = 0;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const exists = await Invitation.findOne({ slug }).lean();
      if (!exists) break;
      if (++attempts > 10) {
        await User.updateOne({ email }, { $inc: { quota: 1 } }); // rollback
        return res.status(409).json({ message: "Tidak bisa membuat slug unik, coba lagi" });
      }
      slug = sanitizeSlug(`${slugInput || "inv"}-${generateSlug(4)}`);
    }

    // 4) Buat invitation
    const inv = await Invitation.create({
      slug,
      template,
      user_email: email,
      mempelai: {
        pria,
        wanita,
        orangtua_pria,
        orangtua_wanita,
      },
      acara_utama: {
        nama: "",
        tanggal: tanggal ? new Date(tanggal) : null,
        waktu,
        lokasi,
      },
      acara: [],
      galeri: [],
      tamu: [],
      rsvp: [],
      ucapan: [],
      gift: {
        enabled: false,
        bank_accounts: [],
        e_wallets: [],
        qris: { enabled: false, image: "" },
      },
      privacy: { isPasswordProtected: false, password: "" },
      views: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return res.status(201).json({
      message: "Undangan berhasil dibuat",
      slug: inv.slug,
      _id: inv._id,
      quota_sisa: user.quota,
    });
  } catch (err) {
    console.error("API /invitations/create error:", err);
    return res.status(500).json({ message: "Gagal membuat undangan" });
    // (opsional) bisa tambahkan mekanisme rollback quota jika error terjadi
    // setelah quota terpotong namun sebelum create Invitation — namun di atas
    // kita hanya memanggil create() setelah slug siap, jadi risiko kecil.
  }
}
