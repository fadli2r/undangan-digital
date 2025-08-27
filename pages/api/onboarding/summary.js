// pages/api/onboarding/summary.js
import dbConnect from "@/lib/dbConnect";
import Package from "@/models/Package";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    await dbConnect();

    const { packageId } = req.body;

    if (!packageId) {
      return res.status(400).json({ message: "Missing packageId" });
    }

    const paket = await Package.findById(packageId);
    if (!paket) {
      return res.status(404).json({ message: "Paket tidak ditemukan" });
    }

    return res.status(200).json({ package: paket });
  } catch (err) {
    console.error("Error fetching onboarding summary:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}
