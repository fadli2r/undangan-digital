// pages/api/admin/packages/index.js
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]";
import dbConnect from "../../../../lib/dbConnect";
import Package from "../../../../models/Package";

export default async function handler(req, res) {
  await dbConnect();

  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user?.isAdmin) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { method } = req;

  switch (method) {
    case "GET": {
      try {
        const { search = "", status = undefined, sortBy = "createdAt", sortOrder = "desc" } =
          req.query;

        const query = {};
        if (search) {
          query.$or = [
            { name: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } },
          ];
        }
        if (status !== undefined) {
          query.isActive = String(status) === "true";
        }

        const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

        const packages = await Package.find(query).sort(sort).lean();

        return res.status(200).json({ packages });
      } catch (error) {
        console.error("Error fetching packages:", error);
        return res
          .status(500)
          .json({ error: "Terjadi kesalahan saat mengambil data paket" });
      }
    }

    case "POST": {
      try {
        const {
          name,
          description,
          price,
          originalPrice,
          duration,
          features,
          limits,
          metadata,
          isActive,
          isPopular,
          isFeatured,
          sortOrder,
        } = req.body;

        if (!name || !description || !price || !duration) {
          return res
            .status(400)
            .json({ error: "Nama, deskripsi, harga, dan durasi wajib diisi" });
        }

        if (!duration?.value || !duration?.unit) {
          return res
            .status(400)
            .json({ error: "Durasi harus memiliki nilai dan unit" });
        }

        if (price <= 0) {
          return res.status(400).json({ error: "Harga harus lebih dari 0" });
        }

        const newPackage = await Package.create({
          name,
          description,
          price: parseFloat(price),
          originalPrice: originalPrice ? parseFloat(originalPrice) : null,
          duration,
          features: features || [],
          limits: limits || {},
          metadata: metadata || {},
          isActive: isActive !== false,
          isPopular: !!isPopular,
          isFeatured: !!isFeatured,
          sortOrder: sortOrder || 0,
        });

        return res
          .status(201)
          .json({ message: "Paket berhasil dibuat", package: newPackage });
      } catch (error) {
        console.error("Error creating package:", error);
        if (error.name === "ValidationError") {
          const errors = Object.values(error.errors).map((e) => e.message);
          return res.status(400).json({ error: errors.join(", ") });
        }
        return res
          .status(500)
          .json({ error: "Terjadi kesalahan saat membuat paket" });
      }
    }

    default:
      res.setHeader("Allow", ["GET", "POST"]);
      return res.status(405).json({ error: `Method ${method} tidak diizinkan` });
  }
}
