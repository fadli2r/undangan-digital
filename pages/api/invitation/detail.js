// pages/api/invitation/detail.js
import dbConnect from "../../../lib/dbConnect";
import Invitation from "../../../models/Invitation";
import Package from "../../../models/Package"; // ⬅️ penting: register model Package
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

function serialize(doc) {
  if (!doc) return doc;
  const src = doc.toObject ? doc.toObject() : doc;
  const dst = {};
  for (const k of Object.keys(src)) {
    const v = src[k];
    if (v instanceof Date) {
      dst[k] = v.toISOString();
    } else if (Array.isArray(v)) {
      dst[k] = v.map((it) => (it && typeof it === "object" ? serialize(it) : it));
    } else if (v && typeof v === "object") {
      dst[k] = v._id ? { ...serialize(v), _id: String(v._id) } : serialize(v);
    } else {
      dst[k] = v;
    }
  }
  if (src._id) dst._id = String(src._id);
  return dst;
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ message: "Method not allowed" });
  }

  // Non-cache
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "no-store");

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.email) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    await dbConnect();

    const raw = req.query.slug;
    const slugParam = Array.isArray(raw) ? raw[0] : raw;
    if (!slugParam) {
      return res.status(400).json({ message: "Slug diperlukan" });
    }
    const key = String(slugParam).trim().toLowerCase();

    // Cari undangan milik user berdasarkan slug / custom_slug
    const invitation = await Invitation.findOne({
      user_email: session.user.email,
      $or: [{ slug: key }, { custom_slug: key }],
    })
      .populate({
        path: "packageId",
        model: Package,
        select: "name slug type featureKeys selectableFeatures price",
      })
      .lean();

    if (!invitation) {
      return res
        .status(404)
        .json({ message: "Undangan tidak ditemukan", undangan: null });
    }

    // Stats ringkas
    const stats = {
      views: invitation.views || 0,
      rsvp: Array.isArray(invitation.rsvp) ? invitation.rsvp.length : 0,
      wishes: Array.isArray(invitation.ucapan) ? invitation.ucapan.length : 0,
      shares: invitation.shares || 0,
    };

    // Merge allowedFeatures (dari package + invitation) untuk gating di FE
    const pkgKeys = Array.isArray(invitation?.packageId?.featureKeys)
      ? invitation.packageId.featureKeys
      : [];
    const inviteAllowed = Array.isArray(invitation?.allowedFeatures)
      ? invitation.allowedFeatures
      : [];
    const allowedFeatures = Array.from(
      new Set(
        [...pkgKeys, ...inviteAllowed]
          .map((k) => String(k || "").toLowerCase().trim())
          .filter(Boolean)
      )
    );

    const data = serialize({ ...invitation, stats, allowedFeatures });

    return res.status(200).json({ undangan: data });
  } catch (error) {
    console.error("Error fetching invitation:", error);
    return res.status(500).json({
      message: "Terjadi kesalahan server",
      error: "INTERNAL_SERVER_ERROR",
    });
  }
}
