// pages/api/invitation/mark-attendance.js
import { v4 as uuidv4 } from "uuid";
import formidable from "formidable";
import dbConnect from "../../../utils/db";
import Invitation from "../../../models/Invitation";
import { uploadToStorage } from "../../../utils/storage"; // ⬅️ adapter Cloudinary/lokal

export const config = {
  api: { bodyParser: false, sizeLimit: "20mb" },
};

// promisify formidable; simpan file sementara ke /tmp (satu-satunya folder writeable di Vercel)
function parseForm(req) {
  return new Promise((resolve, reject) => {
    const form = formidable({
      uploadDir: "/tmp",
      keepExtensions: true,
      multiples: false,
      maxFileSize: 20 * 1024 * 1024,
      filter: ({ mimetype }) => !!mimetype && mimetype.startsWith("image/"),
      filename: () => `${uuidv4()}`, // nama sementara saat di /tmp
    });
    form.parse(req, (err, fields, files) => (err ? reject(err) : resolve({ fields, files })));
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });

  try {
    const { fields, files } = await parseForm(req);

    const slug = Array.isArray(fields.slug) ? fields.slug[0] : fields.slug;
    const guest = Array.isArray(fields.guest) ? fields.guest[0] : fields.guest;
    const jumlah = Array.isArray(fields.jumlah) ? fields.jumlah[0] : fields.jumlah;
    const photoFile = Array.isArray(files.photo) ? files.photo[0] : files.photo;

    if (!slug || !guest) {
      return res.status(400).json({ message: "Missing required fields: slug or guest" });
    }

    await dbConnect();
    const invitation = await Invitation.findOne({ slug });
    if (!invitation) return res.status(404).json({ message: "Invitation not found" });

    const now = new Date();
    const count = Math.max(1, parseInt(jumlah || "1", 10));
    const guestNorm = String(guest).trim();

    // ✔️ Upload foto ke storage (Cloudinary di Vercel, lokal ke public/uploads)
    let photoUrl = null;
    if (photoFile) {
      // simpan rapi per undangan
      photoUrl = await uploadToStorage(photoFile, `attendance/${slug}`);
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

    // ✅ Tambah / update attendance[]
    const existingIdx = invitation.attendance.findIndex(
      (a) => (a.name || "").toLowerCase().trim() === guestNorm.toLowerCase()
    );

    const newEntry = {
      name: guestNorm,
      jumlah: count,
      timestamp: now,
      photo: photoUrl,
      invited: true,
    };

    if (existingIdx >= 0) {
      invitation.attendance[existingIdx] = {
        ...invitation.attendance[existingIdx],
        ...newEntry,
      };
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
      error: error?.message || "UNKNOWN",
    });
  }
}
