import dbConnect from "@/lib/dbConnect";
import Feature from "@/models/Feature";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    await dbConnect();

    const raw = req.query.keys;
    let keys = [];
    if (raw) {
      const s = Array.isArray(raw) ? raw[0] : raw;
      keys = String(s)
        .split(",")
        .map((k) => k.trim().toLowerCase())
        .filter(Boolean);
    }

    const filter = { active: true };
    if (keys.length) filter.key = { $in: keys };

    const docs = await Feature.find(filter)
      .select("key name price description active")
      .lean();

    const features = docs.map((d) => ({
      _id: String(d._id),
      key: d.key,
      name: d.name || d.key,
      price: typeof d.price === "number" ? d.price : 0,
      description: d.description || "",
      active: !!d.active,
    }));

    return res.status(200).json({ features });
  } catch (e) {
    console.error("GET /api/features/list error:", e);
    return res.status(500).json({ message: "INTERNAL_SERVER_ERROR" });
  }
}
