import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import formidable from "formidable";
import dbConnect from "../../../utils/db";
import Invitation from "../../../models/Invitation";

// ⛔ disable bodyParser bawaan Next.js (wajib untuk formidable)
export const config = {
  api: {
    bodyParser: false,
  },
};

// ✅ helper simpan file upload
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

      // ✅ ambil data
      const slug = Array.isArray(fields.slug) ? fields.slug[0] : fields.slug;
      const guest = Array.isArray(fields.guest) ? fields.guest[0] : fields.guest;
      const jumlah = Array.isArray(fields.jumlah) ? fields.jumlah[0] : fields.jumlah;
      const kontak = Array.isArray(fields.kontak) ? fields.kontak[0] : fields.kontak;
      const manual_note = Array.isArray(fields.manual_note) ? fields.manual_note[0] : fields.manual_note;
      const photoFile = Array.isArray(files.photo) ? files.photo[0] : files.photo;

      if (!slug || !guest) {
        return res.status(400).json({ message: "Missing required fields: slug or guest" });
      }

      // ✅ cari undangan
      await dbConnect();
      const invitation = await Invitation.findOne({ slug });
      if (!invitation) {
        return res.status(404).json({ message: "Invitation not found" });
      }

      // ✅ simpan foto
      let photoUrl = null;
      if (photoFile) {
        photoUrl = saveUploadedFile(photoFile);
      }

      const now = new Date();
      const count = Math.max(1, parseInt(jumlah || "1", 10));

      // ✅ buat entry manual langsung ke attendance
      const newAttendance = {
        name: guest.trim(),
        kontak: kontak || "",
        jumlah: count,
        timestamp: now,
        photo: photoUrl,
        invited: false,       // penting → manual
        manual_note: manual_note || "",
        status: "hadir",
      };

      invitation.attendance.push(newAttendance);
      await invitation.save();

      return res.status(200).json({
        message: "✅ Manual guest added successfully",
        attendance: newAttendance,
      });
    } catch (error) {
      console.error("API Error in add-manual:", error);
      return res.status(500).json({
        message: "❌ Internal server error",
        error: error.message,
      });
    }
  });
}
