// pages/api/invitation/upload-main-photo.js
import formidable from "formidable";
import dbConnect from "../../../lib/dbConnect";
import Invitation from "../../../models/Invitation";
import { uploadToStorage, deleteFromStorage } from "../../../utils/storage";

export const config = {
  api: { bodyParser: false, sizeLimit: "20mb" }, // Vercel: wajib bodyParser: false
};

// Promisify formidable.parse (tulis file TEMPORER ke /tmp)
function parseForm(req) {
  return new Promise((resolve, reject) => {
    const form = formidable({
      uploadDir: "/tmp",            // ✅ satu-satunya folder writeable di Vercel
      keepExtensions: true,
      multiples: false,
      maxFileSize: 5 * 1024 * 1024, // 5MB (samakan dengan versi lama)
      filter: ({ mimetype }) => !!mimetype && mimetype.includes("image"),
    });
    form.parse(req, (err, fields, files) => (err ? reject(err) : resolve([fields, files])));
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  try {
    const [fields, files] = await parseForm(req);

    const file = Array.isArray(files.foto) ? files.foto[0] : files.foto;
    if (!file) return res.status(400).json({ error: "No file uploaded" });

    const slug = Array.isArray(fields.slug) ? fields.slug[0] : fields.slug;
    if (!slug) return res.status(400).json({ error: "Slug is required" });

    // ⬇️ Upload via adapter (Vercel => Cloudinary, lokal => public/uploads)
    // simpan rapi per undangan: main-photos/<slug>
    const url = await uploadToStorage(file, `main-photos/${slug}`);

    // Update ke MongoDB
    await dbConnect();
    const invitation = await Invitation.findOne({ slug });
    if (!invitation) return res.status(404).json({ error: "Invitation not found" });

    // Hapus foto lama (Cloudinary / lokal) jika ada
    if (invitation.main_photo) {
      try { await deleteFromStorage(invitation.main_photo); } catch { /* ignore */ }
    }

    invitation.main_photo = url;
    await invitation.save();

    return res.status(200).json({ url });
  } catch (e) {
    console.error("[upload-main-photo] error:", e?.message || e);
    return res.status(500).json({ error: "Gagal upload file" });
  }
}
