// pages/api/admin/order/index.js
import dbConnect from "../../../../lib/dbConnect";
import Order from "../../../../models/Order";
import Package from "../../../../models/Package";
import { requireAdminSession } from "../../../../lib/requireAdminSession";
import mongoose from "mongoose";

function escapeRegex(s) {
  return String(s || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export default async function handler(req, res) {
  const session = await requireAdminSession(req, res);
  if (!session) return; // requireAdminSession sudah handle response

  await dbConnect();

  const {
    page = 1,
    search = "",
    status = "all",
    sortBy = "date",
    sortOrder = "desc",
  } = req.query;

  const limit = 10;
  const skip = (Number(page) - 1) * limit;

  // ---- Filter dasar ----
  const filter = {};
  if (status !== "all") filter.status = status;

  // ---- Handle SEARCH ----
  let orFilters = [];
  if (search) {
    const s = String(search).trim();
    const rx = new RegExp(escapeRegex(s), "i");

    // cari by email, external_id, invoice_id, xendit.*, invitation_slug
    orFilters.push(
      { email: rx },
      { external_id: rx },
      { invoice_id: rx },
      { invitation_slug: rx },
      { "xendit.invoiceId": rx },
      { "xendit.externalId": rx }
    );

    // kalau search kemungkinan ObjectId → cocokkan _id, userId, packageId
    if (mongoose.Types.ObjectId.isValid(s)) {
      const oid = new mongoose.Types.ObjectId(s);
      orFilters.push(
        { _id: oid },
        { userId: oid },
        { packageId: oid }
      );
    }

    // cari package by name/slug → masukkan id-nya ke filter
    const pkgs = await Package.find({ $or: [{ name: rx }, { slug: rx }] })
      .select("_id")
      .lean();
    if (pkgs.length) {
      orFilters.push({ packageId: { $in: pkgs.map((p) => p._id) } });
    }

    filter.$or = orFilters;
  }

  // ---- Sorting ----
  // "date" → createdAt (default), bisa tambah "amount", "status" dll.
  const sortField =
    sortBy === "date" ? "createdAt" :
    sortBy === "amount" ? "amount" :
    sortBy === "status" ? "status" :
    sortBy; // fallback kalau dikirim field lain
  const sort = { [sortField]: sortOrder === "asc" ? 1 : -1 };

  try {
    const [orders, total] = await Promise.all([
      Order.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate({ path: "packageId", select: "name slug type price" }) // ⬅️ ambil nama paket
        .lean(),
      Order.countDocuments(filter),
    ]);

    // (opsional) normalisasi minimal agar FE enak pakai
    const norm = (d) =>
      d && typeof d.toISOString === "function" ? d.toISOString() : d || null;

    const rows = orders.map((o) => ({
      _id: String(o._id),
      email: o.email,
      status: o.status,
      amount:
        typeof o.amount === "number"
          ? o.amount
          : typeof o.harga === "number"
          ? o.harga
          : null,
      currency: o.currency || "IDR",
      createdAt: norm(o.createdAt),
      updatedAt: norm(o.updatedAt),
      paidAt: norm(o.paidAt),
      expiresAt: norm(o.expiresAt),
      external_id: o.external_id || o?.xendit?.externalId || null,
      invoice_id: o.invoice_id || o?.xendit?.invoiceId || null,
      invoice_url: o.invoice_url || o?.xendit?.invoiceUrl || null,
      invitation_slug: o.invitation_slug || null,
      used: !!o.used,
      package: o.packageId
        ? {
            _id: String(o.packageId._id),
            name: o.packageId.name,
            slug: o.packageId.slug,
            type: o.packageId.type,
            price:
              typeof o.packageId.price === "number" ? o.packageId.price : null,
          }
        : null,
      selectedFeatures: Array.isArray(o.selectedFeatures)
        ? o.selectedFeatures
        : [],
    }));

    res.json({
      orders: rows,
      page: Number(page),
      pageSize: limit,
      total,
      totalPages: Math.ceil(total / limit),
      sortBy: sortField,
      sortOrder: sortOrder === "asc" ? "asc" : "desc",
      statusFilter: status,
      search,
    });
  } catch (err) {
    console.error("Orders API error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}
