import dbConnect from "@/lib/dbConnect";
import Package from "@/models/Package";

export default async function handler(req, res) {
  await dbConnect();

  try {
    const packages = await Package.find({ isActive: true }).sort({ sortOrder: 1 }).lean();
    res.status(200).json({ packages });
  } catch (error) {
    console.error("Gagal ambil data paket:", error);
    res.status(500).json({ error: "Failed to fetch packages" });
  }
}
