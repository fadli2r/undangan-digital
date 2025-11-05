import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import formidable from "formidable";
import dbConnect from "../../../utils/db";
import Invitation from "../../../models/Invitation";

export const config = {
  api: {
    bodyParser: false,
  },
};

const saveUploadedFile = (file) => {
  try {
    const uploadDir = path.join(process.cwd(), "public", "uploads", "attendance");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    if (!file.filepath) throw new Error("Temporary file path not found.");

    const ext = path.extname(file.originalFilename || ".jpg");
    const fileName = `${uuidv4()}${ext}`;
    const newPath = path.join(uploadDir, fileName);

    fs.renameSync(file.filepath, newPath);
    return `/uploads/attendance/${fileName}`;
  } catch (error) {
    console.error("File upload failed:", error);
    throw new Error("Failed to save uploaded file.");
  }
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const form = formidable({ keepExtensions: true });

  form.parse(req, async (err, fields, files) => {
    try {
      if (err) {
        console.error("Form parse error:", err);
        return res.status(500).json({ message: "Error parsing form data" });
      }

      const slug = Array.isArray(fields.slug) ? fields.slug[0] : fields.slug;
      const guest = Array.isArray(fields.guest) ? fields.guest[0] : fields.guest;
      const jumlah = Array.isArray(fields.jumlah) ? fields.jumlah[0] : fields.jumlah;
      const photoFile = Array.isArray(files.photo) ? files.photo[0] : files.photo;

      if (!slug || !guest) {
        return res.status(400).json({ message: "Missing required fields: slug or guest" });
      }

      await dbConnect();
      const invitation = await Invitation.findOne({ slug });
      if (!invitation) {
        return res.status(404).json({ message: "Invitation not found" });
      }

      const now = new Date();
      const count = Math.max(1, parseInt(jumlah || "1", 10));
      const guestNorm = String(guest).trim();

      let photoUrl = null;
      if (photoFile) {
        photoUrl = saveUploadedFile(photoFile);
      }

      // ✅ Update di tamu[] (kalau ada)
      if (Array.isArray(invitation.tamu)) {
        const idx = invitation.tamu.findIndex(
          (t) => (t.nama || "").toLowerCase().trim() === guestNorm.toLowerCase()
        );
        if (idx >= 0) {
          invitation.tamu[idx] = {
            ...invitation.tamu[idx],
            jumlah_hadir: count,
            hadir_checkin: true,
            waktu_checkin: now,
            status: "hadir",
            photo: photoUrl,
          };
        }
      }

      // ✅ Tambahkan ke attendance[]
      const existingIdx = invitation.attendance.findIndex(
        (a) => (a.name || "").toLowerCase().trim() === guestNorm.toLowerCase()
      );

      const newEntry = {
        name: guestNorm,
        jumlah: count,
        timestamp: now,
        photo: photoUrl,
        invited: true, // karena dari daftar tamu
      };

      if (existingIdx >= 0) {
        invitation.attendance[existingIdx] = { ...invitation.attendance[existingIdx], ...newEntry };
      } else {
        invitation.attendance.push(newEntry);
      }

      await invitation.save();

      return res.status(200).json({
        message: `✅ Kehadiran ${guestNorm} berhasil dicatat`,
        guest: newEntry,
        totalGuests: invitation.attendance.reduce((sum, g) => sum + (g.jumlah || 1), 0),
      });
    } catch (error) {
      console.error("API Error in mark-attendance:", error);
      return res.status(500).json({
        message: "❌ Internal server error",
        error: error.message,
      });
    }
  });
}
