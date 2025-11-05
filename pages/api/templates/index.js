// pages/api/templates/index.js
import dbConnect from "../../../lib/dbConnect";
import Template from "@/models/Template";

export default async function handler(req, res) {
  await dbConnect();

  const method = req.method;
  try {
    switch (method) {
      // GET all templates
      case "GET": {
        const templates = await Template.find().sort({ createdAt: -1 }).lean();
        return res.status(200).json({ ok: true, templates });
      }

      // POST create new template
      case "POST": {
        const { slug, name, description, thumbnail, category, price, isPremium } =
          req.body;

        if (!slug || !name)
          return res.status(400).json({ ok: false, message: "Slug dan nama wajib diisi." });

        const existing = await Template.findOne({ slug });
        if (existing)
          return res.status(400).json({ ok: false, message: "Slug sudah digunakan." });

        const template = await Template.create({
          slug,
          name,
          description,
          thumbnail,
          category,
          price,
          isPremium,
        });

        return res.status(201).json({ ok: true, template });
      }

      // PUT update template
      case "PUT": {
        const { id, ...data } = req.body;
        const updated = await Template.findByIdAndUpdate(id, data, { new: true });
        return res.status(200).json({ ok: true, updated });
      }

      // DELETE
      case "DELETE": {
        const { id } = req.query;
        await Template.findByIdAndDelete(id);
        return res.status(200).json({ ok: true });
      }

      default:
        return res.status(405).json({ ok: false, message: "Method not allowed" });
    }
  } catch (err) {
    console.error("API Error:", err);
    return res.status(500).json({ ok: false, message: err.message });
  }
}
