// /pages/api/orders/available.js
import dbConnect from "@/lib/dbConnect";
import Order from "@/models/Order";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

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

    await dbConnect();

    const orders = await Order.find({
      user_email: session.user.email.toLowerCase(),
      status: "paid",
      used: false,
      packageId: { $ne: null }, // ✅ filter hanya order valid
    })
      .sort({ created_at: 1 })
      .limit(5)
      .populate("packageId", "name type featureKeys selectableFeatures") // 🟢 aman populate
      .lean();

    return res.status(200).json({ available: orders });
  } catch (e) {
    console.error("[API] /orders/available error:", e);
    return res.status(500).json({ message: "Terjadi kesalahan server." });
  }
}
