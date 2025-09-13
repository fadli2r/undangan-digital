// pages/api/orders/[id].js
import dbConnect from "../../../lib/dbConnect";
import Order from "../../../models/Order";
import Package from "../../../models/Package";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import mongoose from "mongoose";

export default async function handler(req, res) {
  // JSON-only + no-store
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.email) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { id } = req.query;
    if (!id || !mongoose.Types.ObjectId.isValid(String(id))) {
      return res.status(400).json({ message: "Invalid order id" });
    }

    await dbConnect();

    const order = await Order.findById(id).lean();
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // ✅ Perbaikan: terima user_email ATAU email sebagai kepemilikan
    const ownerEmail = String(session.user.email || "").toLowerCase();
    const isOwner = [order.user_email, order.email]
      .map(v => String(v || "").toLowerCase())
      .includes(ownerEmail);

    if (!isOwner) {
      return res.status(403).json({ message: "Forbidden" });
    }

    // (Opsional) ambil info paket untuk tampilkan nama di UI
    let pkg = null;
    if (order.packageId) {
      pkg = await Package.findById(order.packageId)
        .select("_id name slug type featureKeys selectableFeatures price")
        .lean();
    }

    // Normalisasi tanggal → ISO string
    const iso = (d) =>
      d && typeof d.toISOString === "function" ? d.toISOString() : d || null;

    return res.status(200).json({
      order: {
        _id: String(order._id),
        status: order.status,
        used: !!order.used,
        invitation_slug: order.invitation_slug || null,
        amount:
          typeof order.amount === "number"
            ? order.amount
            : typeof order.harga === "number"
            ? order.harga
            : null,
        invoice_url: order.invoice_url || order?.xendit?.invoiceUrl || null,
        external_id: order.external_id || order?.xendit?.externalId || null,
        invoice_id: order.invoice_id || order?.xendit?.invoiceId || null,
        createdAt: iso(order.createdAt),
        updatedAt: iso(order.updatedAt),
        paidAt: iso(order.paidAt),
        expiresAt: iso(order.expiresAt),
        selectedFeatures: Array.isArray(order.selectedFeatures)
          ? order.selectedFeatures
          : [],
        package: pkg
          ? {
              _id: String(pkg._id),
              name: pkg.name,
              slug: pkg.slug,
              type: pkg.type,
              featureKeys: pkg.featureKeys || [],
              selectableFeatures: pkg.selectableFeatures || [],
              price: typeof pkg.price === "number" ? pkg.price : null,
            }
          : null,
      },
    });
  } catch (e) {
    console.error("GET /api/orders/[id] error:", e);
    return res.status(500).json({ message: "INTERNAL_SERVER_ERROR" });
  }
}
