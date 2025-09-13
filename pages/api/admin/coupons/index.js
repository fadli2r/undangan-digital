// pages/api/admin/coupons/index.js
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import dbConnect from "@/lib/dbConnect";
import Coupon from "@/models/Coupon";
import Package from "@/models/Package";
import Admin from "@/models/Admin";

export default async function handler(req, res) {
  await dbConnect();

  // Validasi session admin
  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user?.isAdmin) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // resolve admin _id untuk createdBy/logging
  const adminDoc = await Admin.findOne({ email: session.user.email }).select("_id");
  const adminId = adminDoc?._id || null;

  const { method } = req;

  switch (method) {
    case "GET": {
      try {
        const {
          page = 1,
          limit = 10,
          search = "",
          status = "all",
          type = "all",
          sortBy = "createdAt",
          sortOrder = "desc",
        } = req.query;

        const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
        const sortDirection = sortOrder === "desc" ? -1 : 1;

        const now = new Date();
        const filter = {};

        if (search) {
          filter.$or = [
            { code: { $regex: search, $options: "i" } },
            { name: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } },
          ];
        }

        if (status !== "all") {
          if (status === "active") {
            filter.isActive = true;
            filter.startDate = { $lte: now };
            filter.endDate = { $gte: now };
          } else if (status === "inactive") {
            filter.isActive = false;
          } else if (status === "expired") {
            filter.endDate = { $lt: now };
          } else if (status === "scheduled") {
            filter.startDate = { $gt: now };
          } else if (status === "exhausted") {
            filter.$expr = {
              $and: [
                { $ne: ["$usageLimit", null] },
                { $gte: ["$usageCount", "$usageLimit"] },
              ],
            };
          }
        }

        if (type !== "all") filter.type = type;

        const coupons = await Coupon.find(filter)
          .populate("createdBy", "name email")
          .populate("applicablePackages", "name price")
          .populate("excludedPackages", "name price")
          .sort({ [sortBy]: sortDirection })
          .skip(skip)
          .limit(parseInt(limit, 10));

        const total = await Coupon.countDocuments(filter);

        const stats = await Coupon.aggregate([
          {
            $group: {
              _id: null,
              totalCoupons: { $sum: 1 },
              activeCoupons: {
                $sum: {
                  $cond: [
                    {
                      $and: [
                        { $eq: ["$isActive", true] },
                        { $lte: ["$startDate", now] },
                        { $gte: ["$endDate", now] },
                      ],
                    },
                    1,
                    0,
                  ],
                },
              },
              totalUsage: { $sum: "$usageCount" },
              totalDiscountGiven: {
                $sum: {
                  $reduce: {
                    input: "$usageHistory",
                    initialValue: 0,
                    in: { $add: ["$$value", "$$this.discountAmount"] },
                  },
                },
              },
            },
          },
        ]);

        return res.status(200).json({
          coupons,
          pagination: {
            current: parseInt(page, 10),
            pages: Math.ceil(total / parseInt(limit, 10)),
            total,
            limit: parseInt(limit, 10),
          },
          stats: stats[0] || {
            totalCoupons: 0,
            activeCoupons: 0,
            totalUsage: 0,
            totalDiscountGiven: 0,
          },
        });
      } catch (error) {
        console.error("Error fetching coupons:", error);
        return res.status(500).json({ error: "Failed to fetch coupons" });
      }
    }

    case "POST": {
      try {
        const {
          code,
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

        if (!code || !name || !type || !value || !startDate || !endDate) {
          return res.status(400).json({
            error: "Kode, nama, tipe, nilai, tanggal mulai, dan tanggal berakhir wajib diisi",
          });
        }

        const existing = await Coupon.findOne({ code: code.toUpperCase() });
        if (existing) {
          return res.status(400).json({ error: "Kode kupon sudah digunakan" });
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

        const newCoupon = await Coupon.create({
          code: code.toUpperCase(),
          name,
          description,
          type,
          value: parseFloat(value),
          minimumAmount: parseFloat(minimumAmount) || 0,
          maximumDiscount: maximumDiscount ? parseFloat(maximumDiscount) : undefined,
          usageLimit: usageLimit ? parseInt(usageLimit, 10) : undefined,
          userUsageLimit: parseInt(userUsageLimit, 10) || 1,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          isActive: isActive !== false,
          applicablePackages: applicablePackages || [],
          excludedPackages: excludedPackages || [],
          createdBy: adminId,
        });

        const populated = await Coupon.findById(newCoupon._id)
          .populate("createdBy", "name email")
          .populate("applicablePackages", "name price")
          .populate("excludedPackages", "name price");

        return res.status(201).json({
          message: "Kupon berhasil dibuat",
          coupon: populated,
        });
      } catch (error) {
        console.error("Error creating coupon:", error);
        if (error.name === "ValidationError") {
          const errors = Object.values(error.errors).map((e) => e.message);
          return res.status(400).json({ error: errors.join(", ") });
        }
        return res.status(500).json({ error: "Failed to create coupon" });
      }
    }

    default:
      res.setHeader("Allow", ["GET", "POST"]);
      return res.status(405).end(`Method ${method} Not Allowed`);
  }
}
