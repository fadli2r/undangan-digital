// pages/api/admin/users/index.js
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]";
import dbConnect from "../../../../lib/dbConnect";
import User from "../../../../models/User";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user?.isAdmin) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  await dbConnect();

  if (req.method === "GET") {
    try {
      const users = await User.find()
        .select("-password")
        .populate("currentPackage.packageId")
        .populate("invitations")
        .sort({ createdAt: -1 });

      return res.status(200).json({ users });
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch users" });
    }
  }

  if (req.method === "POST") {
    try {
      const { name, email, password, phone, source, packageId } = req.body;

      if (!name || !email || !password) {
        return res
          .status(400)
          .json({ error: "Name, email, and password are required" });
      }

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: "Email already registered" });
      }

      const user = await User.create({
        name,
        email,
        password, // NOTE: pastikan schema handle hash via pre-save hook. Kalau belum, hash di sini.
        phone,
        source: source || "admin",
        currentPackage: packageId
          ? {
              packageId,
              startDate: new Date(),
              endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
              isActive: true,
            }
          : null,
      });

      const userResponse = user.toObject();
      delete userResponse.password;

      return res.status(201).json({ user: userResponse });
    } catch (error) {
      return res.status(500).json({ error: "Failed to create user" });
    }
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
}
