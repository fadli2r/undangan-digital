// pages/api/admin/coupons/[couponId].js
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import dbConnect from "@/lib/dbConnect";
import Coupon from "@/models/Coupon";

export default async function handler(req, res) {
  await dbConnect();

  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user?.isAdmin) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const {
    query: { couponId },
    method,
  } = req;

  switch (method) {
    case "GET":
      try {
        const coupon = await Coupon.findById(couponId)
          .populate("createdBy", "name email")
          .populate("applicablePackages", "name price")
          .populate("excludedPackages", "name price")
          .populate("usageHistory.user", "name email")
          .populate("usageHistory.order", "orderNumber totalAmount");

        if (!coupon) {
          return res.status(404).json({ error: "Kupon tidak ditemukan" });
        }

        return res.status(200).json({ coupon });
      } catch (error) {
        console.error("Error fetching coupon:", error);
        return res.status(500).json({ error: "Failed to fetch coupon" });
      }

    case "PUT":
      try {
        const {
          name,
          description,
          type,
          value,
          minimumAmount,
          maximumDiscount,
          usageLimit,
          userUsageLimit,
          startDate,
          endDate,
          isActive,
          applicablePackages,
          excludedPackages,
        } = req.body;

        const existingCoupon = await Coupon.findById(couponId);
        if (!existingCoupon) {
          return res.status(404).json({ error: "Kupon tidak ditemukan" });
        }

        if (!name || !type || !value || !startDate || !endDate) {
          return res
            .status(400)
            .json({ error: "Nama, tipe, nilai, tanggal mulai, dan tanggal berakhir wajib diisi" });
        }

        if (new Date(endDate) <= new Date(startDate)) {
          return res.status(400).json({ error: "Tanggal berakhir harus setelah tanggal mulai" });
        }

        if (type === "percentage" && (value <= 0 || value > 100)) {
          return res.status(400).json({ error: "Persentase diskon harus antara 1-100%" });
        }

        if (type === "fixed" && value <= 0) {
          return res.status(400).json({ error: "Nilai diskon harus lebih dari 0" });
        }

        const updatedCoupon = await Coupon.findByIdAndUpdate(
          couponId,
          {
            name,
            description,
            type,
            value: parseFloat(value),
            minimumAmount: parseFloat(minimumAmount) || 0,
            maximumDiscount: maximumDiscount ? parseFloat(maximumDiscount) : undefined,
            usageLimit: usageLimit ? parseInt(usageLimit) : undefined,
            userUsageLimit: parseInt(userUsageLimit) || 1,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            isActive: isActive !== false,
            applicablePackages: applicablePackages || [],
            excludedPackages: excludedPackages || [],
          },
          { new: true, runValidators: true }
        )
          .populate("createdBy", "name email")
          .populate("applicablePackages", "name price")
          .populate("excludedPackages", "name price");

        return res.status(200).json({
          message: "Kupon berhasil diperbarui",
          coupon: updatedCoupon,
        });
      } catch (error) {
        console.error("Error updating coupon:", error);
        if (error.name === "ValidationError") {
          const errors = Object.values(error.errors).map((e) => e.message);
          return res.status(400).json({ error: errors.join(", ") });
        }
        return res.status(500).json({ error: "Failed to update coupon" });
      }

    case "DELETE":
      try {
        const coupon = await Coupon.findById(couponId);
        if (!coupon) {
          return res.status(404).json({ error: "Kupon tidak ditemukan" });
        }

        if (coupon.usageCount > 0) {
          return res.status(400).json({ error: "Tidak dapat menghapus kupon yang sudah digunakan" });
        }

        await Coupon.findByIdAndDelete(couponId);
        return res.status(200).json({ message: "Kupon berhasil dihapus" });
      } catch (error) {
        console.error("Error deleting coupon:", error);
        return res.status(500).json({ error: "Failed to delete coupon" });
      }

    default:
      res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
      return res.status(405).end(`Method ${method} Not Allowed`);
  }
}
