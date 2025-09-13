// pages/api/admin/packages/[packageId].js
import dbConnect from "@/lib/dbConnect";
import Package from "@/models/Package";
import { requireAdminSession } from "@/lib/requireAdminSession";

export default async function handler(req, res) {
  const session = await requireAdminSession(req, res);
  if (!session) return; // Unauthorized sudah dijawab requireAdminSession

  await dbConnect();

  const { packageId } = req.query;

  try {
    if (req.method === "GET") {
      const pkg = await Package.findById(packageId);
      if (!pkg) {
        return res.status(404).json({ error: "Package not found" });
      }
      return res.status(200).json({ package: pkg });
    }

    if (req.method === "PUT") {
      const updated = await Package.findByIdAndUpdate(packageId, req.body, {
        new: true,
      });
      if (!updated) {
        return res.status(404).json({ error: "Package not found" });
      }
      return res.status(200).json({ package: updated });
    }

    if (req.method === "DELETE") {
      await Package.findByIdAndDelete(packageId);
      return res.status(200).json({ success: true });
    }

    res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (err) {
    console.error("API error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
