// pages/api/invitation/upload-galeri.js
import formidable from "formidable";
import { uploadToStorage } from "../../../utils/storage"; // ⬅️ pakai adapter, bukan fs/path

// Wajib: matikan bodyParser & set limit
export const config = {
  api: { bodyParser: false, sizeLimit: "20mb" },
};

// Parse multipart ke /tmp (satu-satunya folder writeable di Vercel)
function parseForm(req) {
  return new Promise((resolve, reject) => {
    const form = formidable({
      uploadDir: "/tmp",
      keepExtensions: true,
      multiples: true, // ⬅️ dukung multiple
      maxFileSize: 20 * 1024 * 1024, // 20MB (kalau mau 2MB ganti ke 2 * 1024 * 1024)
      filter: ({ mimetype }) => !!mimetype && mimetype.startsWith("image/"),
    });
    form.parse(req, (err, fields, files) => (err ? reject(err) : resolve([fields, files])));
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  try {
    const [fields, files] = await parseForm(req);

    // field file: "foto" (boleh single atau array)
    const raw = files?.foto;
    const list = Array.isArray(raw) ? raw : raw ? [raw] : [];
    if (!list.length) return res.status(400).json({ error: "No file uploaded" });

    // folder di storage (rapikan sesuai kebutuhan, mis. galeri/<slug>)
    const folder = "galeri";

    // Upload satu per satu via adapter (Vercel => Cloudinary, lokal => public/uploads)
    const urls = [];
    for (const f of list) {
      const url = await uploadToStorage(f, folder);
      urls.push(url);
    }

    // Jika mau simpan ke MongoDB, lakukan di sini (Invitation.updateOne ...)

    return res.status(200).json({ urls });
  } catch (e) {
    console.error("[upload-galeri] error:", e?.message || e);
    return res.status(500).json({ error: "Gagal upload file" });
  }
}
