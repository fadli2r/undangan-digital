// pages/api/invitation/add-manual.js
import formidable from "formidable";
import { v4 as uuidv4 } from "uuid";
import dbConnect from "../../../utils/db";
import Invitation from "../../../models/Invitation";
import { uploadToStorage } from "../../../utils/storage";

export const config = { api: { bodyParser: false, sizeLimit: "20mb" } };

// --- CORS helper (kalau perlu cross-origin)
function setCORS(res) {
  res.setHeader("Access-Control-Allow-Origin", "*"); // ganti ke domain kamu jika perlu
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

// --- Promisify formidable.parse; taruh temp file di /tmp (writeable di Vercel)
function parseForm(req) {
  return new Promise((resolve, reject) => {
    const form = formidable({
      uploadDir: "/tmp",
      keepExtensions: true,
      multiples: false,
      maxFileSize: 20 * 1024 * 1024,
      filter: ({ mimetype }) => !!mimetype && mimetype.startsWith("image/"),
      filename: () => uuidv4(), // nama file sementara di /tmp
    });
    form.parse(req, (err, fields, files) => (err ? reject(err) : resolve({ fields, files })));
  });
}

export default async function handler(req, res) {
  setCORS(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });

  try {
    const { fields, files } = await parseForm(req);

    // ✅ ambil data
    const slug = Array.isArray(fields.slug) ? fields.slug[0] : fields.slug;
    const guest = Array.isArray(fields.guest) ? fields.guest[0] : fields.guest;
    const jumlah = Array.isArray(fields.jumlah) ? fields.jumlah[0] : fields.jumlah;
    const kontak = Array.isArray(fields.kontak) ? fields.kontak[0] : fields.kontak;
    const manual_note = Array.isArray(fields.manual_note) ? fields.manual_note[0] : fields.manual_note;

    if (!slug || !guest) {
      return res.status(400).json({ message: "Missing required fields: slug or guest" });
    }

    // ✅ upload foto (opsional)
    const rawPhoto = files?.photo || files?.file || files?.image || null;
    const photoFile = Array.isArray(rawPhoto) ? rawPhoto[0] : rawPhoto;

    let photoUrl = null;
    if (photoFile) {
      // simpan rapi per undangan: attendance/<slug>
      photoUrl = await uploadToStorage(photoFile, `attendance/${slug}`);
    }

    // ✅ simpan ke DB
    await dbConnect();
    const invitation = await Invitation.findOne({ slug });
    if (!invitation) return res.status(404).json({ message: "Invitation not found" });

    const now = new Date();
    const count = Math.max(1, parseInt(jumlah || "1", 10));

    const newAttendance = {
      name: String(guest || "").trim(),
      kontak: kontak || "",
      jumlah: count,
      timestamp: now,
      photo: photoUrl,
      invited: false, // manual entry
      manual_note: manual_note || "",
      status: "hadir",
    };

    invitation.attendance = Array.isArray(invitation.attendance) ? invitation.attendance : [];
    invitation.attendance.push(newAttendance);
    await invitation.save();

    return res.status(200).json({
      message: "✅ Manual guest added successfully",
      attendance: newAttendance,
    });
  } catch (error) {
    console.error("[add-manual] error:", error?.message || error);
    return res.status(500).json({
      message: "❌ Internal server error",
      error: error?.message || "UNKNOWN",
    });
  }
}
