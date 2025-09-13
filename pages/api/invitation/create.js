// /pages/api/invitations/create.js
import dbConnect from "@/lib/dbConnect";
import Invitation from "@/models/Invitation";
import User from "@/models/User";
import Order from "@/models/Order";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

function sanitizeSlug(raw) {
  return String(raw || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function generateSlug(len = 8) {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < len; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export default async function handler(req, res) {
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
    const email = session.user.email.toLowerCase();

    await dbConnect();

    // Body input
    const {
      orderId,
      template,
      slug: slugInput,
      pria = "",
      wanita = "",
      orangtua_pria = "",
      orangtua_wanita = "",
      tanggal,
      waktu = "",
      lokasi = "",
    } = typeof req.body === "string" ? JSON.parse(req.body) : req.body;

    if (!orderId) return res.status(400).json({ message: "OrderId wajib diisi" });
    if (!template) return res.status(400).json({ message: "Template wajib diisi" });

    // Cari order
    const order = await Order.findOne({
      _id: orderId,
      user_email: email,
      status: "paid",
      used: false,
    }).populate("packageId");

    if (!order) {
      return res.status(400).json({ message: "Order tidak valid atau sudah digunakan" });
    }

    // Slug unik
    let slug = sanitizeSlug(slugInput || `${pria}-${wanita}`);
    if (!slug) slug = generateSlug(8);

    let counter = 0;
    while (await Invitation.findOne({ slug })) {
      slug = `${slug}-${generateSlug(4)}`;
      if (++counter > 5) break;
    }

    // Ambil fitur dari package
    const pkg = order.packageId;
    const featureKeys = Array.isArray(pkg?.featureKeys) ? pkg.featureKeys.map(String) : [];

    // Buat invitation
    const inv = await Invitation.create({
      slug,
      template,
      user_email: email,
      packageId: pkg?._id || null,
      allowedFeatures: featureKeys,
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

    // Update order jadi used
    order.used = true;
    order.invitation_slug = inv.slug;
    await order.save();

    // Update user → masukkan ke daftar invitations
    const user = await User.findOne({ email });
    if (user) {
      if (!user.invitations.includes(inv._id)) {
        user.invitations.push(inv._id);
      }
       // Kurangi quota jika masih ada
  if (typeof user.quota === "number" && user.quota > 0) {
    user.quota = user.quota - 1;
  }
      await user.save();
    }

    return res.status(201).json({
      message: "Undangan berhasil dibuat",
      slug: inv.slug,
      _id: inv._id,
      package: pkg ? { id: pkg._id, name: pkg.name } : null,
    });
  } catch (err) {
    console.error("API /invitations/create error:", err);
    return res.status(500).json({ message: "Gagal membuat undangan" });
  }
}
