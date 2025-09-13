// pages/api/admin/invitations/index.js
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]";
import dbConnect from "../../../../lib/dbConnect";
import Invitation from "../../../../models/Invitation";
import ActivityLog from "../../../../models/ActivityLog";
import Admin from "../../../../models/Admin";

export default async function handler(req, res) {
  await dbConnect();

  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user?.isAdmin) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const adminDoc = await Admin.findOne({ email: session.user.email }).select("_id");
  const adminId = adminDoc?._id || null;

  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const {
      search = "",
      status = "all",
      template = "all",
      sortBy = "createdAt",
      sortOrder = "desc",
      page = 1,
      limit = 10,
    } = req.query;

    const query = {};
    if (search) {
      query.$or = [
        { "mempelai.pria": { $regex: search, $options: "i" } },
        { "mempelai.wanita": { $regex: search, $options: "i" } },
        { slug: { $regex: search, $options: "i" } },
      ];
    }
    if (status !== "all") query.status = status;
    if (template !== "all") query.template = template;

    const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const [invitations, totalInvitations] = await Promise.all([
      Invitation.find(query).sort(sort).skip(skip).limit(limitNum).lean(),
      Invitation.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalInvitations / limitNum);

    await ActivityLog.logActivity({
      actor: adminId,
      actorModel: "Admin",
      action: "invitations.view",
      details: {
        filters: { search, status, template, sortBy, sortOrder },
        pagination: { page: pageNum, limit: limitNum },
      },
      ip: req.headers["x-forwarded-for"] || req.connection.remoteAddress,
      userAgent: req.headers["user-agent"],
    });

    return res.status(200).json({
      invitations,
      currentPage: pageNum,
      totalPages,
      totalInvitations,
      hasNextPage: pageNum < totalPages,
      hasPrevPage: pageNum > 1,
    });
  } catch (error) {
    console.error("Get Invitations Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
