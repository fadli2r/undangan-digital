// pages/api/purchases/index.js
import dbConnect from "../../../lib/dbConnect";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import Purchase from "../../../models/Purchase";
import Package from "../../../models/Package";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ message: "Method not allowed" });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?._id) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  await dbConnect();

  const list = await Purchase.find({ userId: session.user._id })
    .sort({ createdAt: -1 })
    .lean();

  // ringkas package name
  const pkgIds = [...new Set(list.map(p => String(p.packageId)))];
  const pkgs = await Package.find({ _id: { $in: pkgIds } })
    .select("_id name type duration")
    .lean();
  const pmap = new Map(pkgs.map(p => [String(p._id), p]));

  const data = list.map(p => ({
    _id: String(p._id),
    status: p.status,
    used: p.status === "used" || !!p.invitationId,
    invitationId: p.invitationId ? String(p.invitationId) : null,
    features: p.features || [],
    selectedFeatures: p.selectedFeatures || [],
    startsAt: p.startsAt,
    expiresAt: p.expiresAt,
    package: pmap.get(String(p.packageId)) || { _id: p.packageId },
  }));

  return res.status(200).json({ purchases: data });
}
