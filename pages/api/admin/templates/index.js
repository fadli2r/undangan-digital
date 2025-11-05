import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]"; // ✅ pastikan path relatif benar
import dbConnect from "@/lib/dbConnect";
import Template from "@/models/Template";
import Admin from "@/models/Admin";

export default async function handler(req, res) {
  await dbConnect();

  // ✅ Validasi session admin
  const session = await getServerSession(req, res, authOptions);
  const user = session?.user;

  if (!session || !(user?.isAdmin || user?.role === "superadmin" || user?.role === "admin")) {
    return res.status(403).json({ ok: false, message: "Akses ditolak." });
  }

  // ✅ Cari admin di DB
  const adminDoc = await Admin.findOne({ email: user.email }).select("_id");
  const adminId = adminDoc?._id || null;

  const { method } = req;

  switch (method) {
    /**
     * =================================
     * GET — list atau detail template
     * =================================
     */
    case "GET":
      try {
        const {
          id,
          page = 1,
          limit = 10,
          search = "",
          sortBy = "createdAt",
          sortOrder = "desc",
        } = req.query;

        if (id) {
          const template = await Template.findById(id);
          if (!template)
            return res.status(404).json({ ok: false, message: "Template tidak ditemukan." });

          return res.status(200).json({ ok: true, template });
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const sortDirection = sortOrder === "desc" ? -1 : 1;
        const filter = search ? { name: { $regex: search, $options: "i" } } : {};

        const total = await Template.countDocuments(filter);
        const templates = await Template.find(filter)
          .sort({ [sortBy]: sortDirection })
          .skip(skip)
          .limit(parseInt(limit));

        return res.status(200).json({
          ok: true,
          templates,
          pagination: {
            current: parseInt(page),
            pages: Math.ceil(total / parseInt(limit)),
            total,
            limit: parseInt(limit),
          },
        });
      } catch (error) {
        console.error("Error fetching templates:", error);
        return res.status(500).json({ ok: false, message: "Gagal mengambil data template." });
      }

    /**
     * =================================
     * POST — buat template baru
     * =================================
     */
    case "POST":
      try {
        const { name, slug, description, thumbnail, category, price, isPremium, isActive } = req.body;

        if (!name || !slug) {
          return res.status(400).json({ ok: false, message: "Nama dan slug wajib diisi." });
        }

        const existing = await Template.findOne({ slug });
        if (existing) {
          return res.status(400).json({ ok: false, message: "Slug sudah digunakan." });
        }

        const newTemplate = await Template.create({
          name,
          slug,
          description,
          thumbnail,
          category,
          price,
          isPremium,
          isActive,
          createdBy: adminId,
        });

        return res.status(201).json({
          ok: true,
          message: "Template berhasil dibuat.",
          template: newTemplate,
        });
      } catch (error) {
        console.error("Error creating template:", error);
        return res.status(500).json({ ok: false, message: "Gagal membuat template." });
      }

    /**
     * =================================
     * PUT — update template
     * =================================
     */
    case "PUT":
      try {
        const { id, ...updateData } = req.body;
        if (!id) return res.status(400).json({ ok: false, message: "ID wajib disertakan." });

        const updated = await Template.findByIdAndUpdate(id, updateData, { new: true });
        if (!updated) return res.status(404).json({ ok: false, message: "Template tidak ditemukan." });

        return res.status(200).json({
          ok: true,
          message: "Template berhasil diperbarui.",
          template: updated,
        });
      } catch (error) {
        console.error("Error updating template:", error);
        return res.status(500).json({ ok: false, message: "Gagal memperbarui template." });
      }

    /**
     * =================================
     * DELETE — hapus template
     * =================================
     */
    case "DELETE":
      try {
        const { id } = req.query;
        if (!id) return res.status(400).json({ ok: false, message: "ID wajib disertakan." });

        const deleted = await Template.findByIdAndDelete(id);
        if (!deleted) return res.status(404).json({ ok: false, message: "Template tidak ditemukan." });

        return res.status(200).json({ ok: true, message: "Template berhasil dihapus." });
      } catch (error) {
        console.error("Error deleting template:", error);
        return res.status(500).json({ ok: false, message: "Gagal menghapus template." });
      }

    default:
      res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
      return res.status(405).json({ ok: false, message: `Method ${method} tidak diizinkan.` });
  }
}
