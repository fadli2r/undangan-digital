// /pages/api/user/billing-history.js
import dbConnect from "@/lib/dbConnect";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import mongoose from "mongoose";

// Pastikan model ter-registered
import Order from "@/models/Order";
import Package from "@/models/Package";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ message: "Method not allowed" });

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.email) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    await dbConnect();

    const email = session.user.email.toLowerCase();

    const orders = await Order.find(
      { user_email: email }, // pakai user_email biar konsisten
      null,
      { sort: { createdAt: -1 } }
    )
      .populate("packageId", "name type")
      .lean();

    const history = orders.map((o) => {
      const hist = Array.isArray(o?.xendit?.history) && o.xendit.history.length
        ? o.xendit.history[o.xendit.history.length - 1]
        : null;

      const invoiceId =
        hist?.invoiceId ||
        o?.xendit?.invoiceId ||
        o?.invoice_id ||
        "-";

      const invoiceUrl =
        hist?.invoiceUrl ||
        o?.xendit?.invoiceUrl ||
        null;

      return {
        id: String(o._id),
        invoiceId,
        invoiceUrl, // <- FE baca ini
        packageName: o?.packageId?.name || "-",
        packageType: o?.packageId?.type || "-",
        amount: o?.amount ?? o?.harga ?? 0,
        status: o?.status || "pending",
        createdAt: o?.createdAt || o?.created_at || o?.paidAt || null,
      };
    });

    return res.status(200).json({ success: true, history });
  } catch (err) {
    console.error("[API] billing-history error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}
