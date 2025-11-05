// pages/api/user/invoice/[id].js
import dbConnect from "@/lib/dbConnect";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]";
import mongoose from "mongoose";
import Order from "@/models/Order";
import "@/models/Package"; // pastikan model Package terdaftar untuk populate

function isObjectIdLike(v) {
  return typeof v === "string" && /^[0-9a-fA-F]{24}$/.test(v);
}

function mapOrderToInvoice(o) {
  const invoiceId = o?.xendit?.invoiceId || o?.invoice_id || String(o?._id);
  const invoiceUrl = o?.xendit?.invoiceUrl || o?.invoice_url || null;

  const pkgName = o?.packageId?.name || o?.package?.name || "-";
  const pkgType = o?.packageId?.type || o?.package?.type || "-";

  // items ringkas
  const items = Array.isArray(o?.items) && o.items.length
    ? o.items.map((it) => {
        const unit = it.unitPrice ?? it.price ?? 0;
        const qty = it.qty ?? it.quantity ?? 1;
        const amount = it.amount ?? unit * qty;
        return {
          name: it.name,
          qty,
          unitPrice: unit,
          amount,
        };
      })
    : [
        {
          name: pkgName,
          qty: o?.quantity ?? 1,
          unitPrice: o?.amount ?? o?.harga ?? 0,
          amount: o?.amount ?? o?.harga ?? 0,
        },
      ];

  const subtotal = items.reduce((a, b) => a + Number(b.amount || 0), 0);

  // normalisasi status
  const status = o.status === "cancelled" ? "canceled" : o.status;

  // buyer (kalau ada di schema kamu)
  const buyer = {
    name: o?.buyer?.name || o?.customer?.name || o?.userName || "",
    email: o?.buyer?.email || o?.email || o?.xendit?.payerEmail || "",
    phone: o?.buyer?.phone || o?.customer?.phone || "",
    address:
      o?.buyer?.address ||
      o?.customer?.address ||
      o?.buyer?.addressText ||
      "",
  };

  return {
    orderId: String(o._id),
    invoiceId,
    invoiceUrl,
    status, // "pending" | "paid" | "expired" | "canceled"
    amount: o.amount ?? o.harga ?? subtotal,
    quantity: o.quantity ?? 1,
    createdAt: o.createdAt ?? o.created_at,
    dueAt: o.expiresAt ?? null,
    package: { name: pkgName, type: pkgType },
    items,
    buyer,
    xendit: {
      payerEmail: o?.xendit?.payerEmail || null,
      paymentChannel: o?.xendit?.paymentChannel || null,
    },
    user_email: o.user_email || o.email,
  };
}

export default async function handler(req, res) {
  if (req.method !== "GET")
    return res.status(405).json({ message: "Method not allowed" });

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.email) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    await dbConnect();

    const { id } = req.query;
    if (!id) return res.status(400).json({ message: "Missing invoice id" });

    const email = session.user.email.toLowerCase();

    // siapkan filter OR untuk beberapa kemungkinan id
    const orConds = [
      { "xendit.invoiceId": id },
      { invoice_id: id },
    ];
    if (isObjectIdLike(id)) {
      orConds.push({ _id: new mongoose.Types.ObjectId(id) });
    }

    const order = await Order.findOne({
      user_email: email, // keamanan: hanya milik user ini
      $or: orConds,
    })
      .populate("packageId", "name type price")
      .lean();

    if (!order) {
      return res.status(404).json({ message: "Invoice tidak ditemukan" });
    }

    const invoice = mapOrderToInvoice(order);
    return res.status(200).json({ invoice });
  } catch (err) {
    console.error("[API] /user/invoice/[id] error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}
