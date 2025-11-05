// pages/api/invitation/e-invitation/upload.js
import formidable from "formidable";
import { uploadToStorage } from "../../../../utils/storage"; // ⬅️ pakai adapter Cloudinary/lokal

export const config = {
  api: { bodyParser: false, sizeLimit: "20mb" }, // wajib untuk formidable
};

// Parse multipart ke /tmp (satu-satunya folder writeable di Vercel)
function parseForm(req) {
  return new Promise((resolve, reject) => {
    const form = formidable({
      uploadDir: "/tmp",
      keepExtensions: true,
      multiples: false,
      maxFileSize: 5 * 1024 * 1024, // 5MB (samakan dg versi lama)
      filter: ({ mimetype }) => !!mimetype && mimetype.startsWith("image/"),
    });
    form.parse(req, (err, fields, files) => (err ? reject(err) : resolve([fields, files])));
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });

  try {
    const [fields, files] = await parseForm(req);

    // field file di FE: "cover"
    const raw = files.cover;
    const uploaded = Array.isArray(raw) ? raw[0] : raw;
    if (!uploaded) return res.status(400).json({ message: "No file uploaded" });

    // Upload via adapter (Vercel => Cloudinary, lokal => public/uploads)
    // Folder rapi: "einvitation" (ubah sesuai kebutuhan)
    const url = await uploadToStorage(uploaded, "einvitation");

    // Bikin filename dari URL (best effort)
    const filename = (() => {
      try {
        const u = new URL(url);
        return (u.pathname.split("/").pop() || "").split("?")[0] || "uploaded";
      } catch {
        return url.split("/").pop() || "uploaded";
      }
    })();

    return res.status(200).json({
      success: true,
      path: url,        // sebelumnya '/uploads/...', sekarang URL Cloudinary / lokal
      filename,
    });
  } catch (error) {
    console.error("[e-invitation/upload] error:", error?.message || error);
    return res.status(500).json({ message: "Upload error", error: error?.message || "UNKNOWN" });
  }
}
