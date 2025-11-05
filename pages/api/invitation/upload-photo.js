// pages/api/.../upload-photos.js
import formidable from "formidable";
import { uploadToStorage } from "../../../utils/storage"; // ⬅️ adapter Cloudinary/local

export const config = {
  api: { bodyParser: false, sizeLimit: "20mb" }, // wajib matikan parser & set limit
};

// Parse multipart ke /tmp (satu-satunya folder writeable di Vercel)
function parseForm(req) {
  return new Promise((resolve, reject) => {
    const form = formidable({
      uploadDir: "/tmp",
      keepExtensions: true,
      multiples: false, // ganti true jika mau multi-upload
      maxFileSize: 20 * 1024 * 1024, // 20MB; set 5MB jika mau persis seperti sebelumnya
      filter: ({ mimetype }) => !!mimetype && mimetype.startsWith("image/"),
    });
    form.parse(req, (err, fields, files) => (err ? reject(err) : resolve([fields, files])));
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });

  try {
    const [fields, files] = await parseForm(req);

    // field file di FE: "photo"
    const raw = files.photo;
    const uploadedFile = Array.isArray(raw) ? raw[0] : raw;
    if (!uploadedFile) return res.status(400).json({ message: "No file uploaded" });

    // Upload via adapter (Vercel => Cloudinary, lokal => public/uploads)
    // folder rapi: "photos" (bisa ubah ke `photos/${fields.slug}` kalau perlu)
    const url = await uploadToStorage(uploadedFile, "photos");

    // bikin filename dari URL (nama file tanpa query)
    const filename = (() => {
      try {
        const u = new URL(url);
        const base = u.pathname.split("/").pop() || "";
        // hapus ekstensi dari Cloudinary public_id (kadang tidak ada ekstensi)
        return base.split("?")[0];
      } catch {
        return url.split("/").pop() || "uploaded";
      }
    })();

    return res.status(200).json({ path: url, filename });
  } catch (error) {
    console.error("[upload-photos] error:", error?.message || error);
    return res.status(500).json({ message: "Error uploading file", error: error?.message || "UNKNOWN" });
  }
}
