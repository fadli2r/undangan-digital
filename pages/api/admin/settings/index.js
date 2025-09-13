// pages/api/admin/settings/index.js
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]";
import dbConnect from "../../../../lib/dbConnect";
import Settings from "../../../../models/Settings";
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

  if (req.method === "GET") {
    try {
      const settings = await Settings.getSettings();
      await ActivityLog.logActivity({
        actor: adminId,
        actorModel: "Admin",
        action: "settings.view",
        ip: req.headers["x-forwarded-for"] || req.connection.remoteAddress,
        userAgent: req.headers["user-agent"],
      });
      return res.status(200).json({ settings });
    } catch (error) {
      console.error("Get Settings Error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  if (req.method === "PUT") {
    try {
      const canEdit = session.user.permissions?.includes("settings.edit");
      if (!canEdit) {
        return res.status(403).json({ error: "Insufficient permissions" });
      }

      const { settings: newSettings } = req.body;
      if (!newSettings) {
        return res.status(400).json({ error: "Settings data is required" });
      }

      const current = await Settings.getSettings();
      const updated = await Settings.updateSettings(newSettings);

      const changes = {};
      Object.keys(newSettings).forEach((section) => {
        if (typeof newSettings[section] === "object") {
          Object.keys(newSettings[section]).forEach((key) => {
            const oldValue = current[section]?.[key];
            const newValue = newSettings[section][key];
            if (oldValue !== newValue) {
              if (!changes[section]) changes[section] = {};
              changes[section][key] = { from: oldValue, to: newValue };
            }
          });
        }
      });

      await ActivityLog.logActivity({
        actor: adminId,
        actorModel: "Admin",
        action: "settings.update",
        details: { changes },
        ip: req.headers["x-forwarded-for"] || req.connection.remoteAddress,
        userAgent: req.headers["user-agent"],
      });

      return res
        .status(200)
        .json({ settings: updated, message: "Settings updated successfully" });
    } catch (error) {
      console.error("Update Settings Error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  res.setHeader("Allow", ["GET", "PUT"]);
  return res.status(405).json({ error: "Method not allowed" });
}
