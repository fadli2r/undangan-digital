// pages/api/templates/upload-thumbnail.js
import formidable from "formidable";
import { uploadToStorage } from "@/utils/storage"; // ⬅️ adapter Cloudinary/lokal

export const config = {
  api: { bodyParser: false, sizeLimit: "20mb" },
};

// Parse multipart ke /tmp (writeable di Vercel)
function parseForm(req) {
  return new Promise((resolve, reject) => {
    const form = formidable({
      uploadDir: "/tmp",
      keepExtensions: true,
      multiples: false,
      maxFileSize: 5 * 1024 * 1024, // 5MB
      filter: ({ mimetype }) => !!mimetype && mimetype.startsWith("image/"),
    });
    form.parse(req, (err, fields, files) => (err ? reject(err) : resolve({ fields, files })));
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  try {
    const { files } = await parseForm(req);

    // Ambil file dari beberapa kemungkinan key (file/thumbnail)
    const pickFirst = (f) =>
      (Array.isArray(f) ? f[0] : f) || null;

    const candidate =
      pickFirst(files?.file) ||
      pickFirst(files?.thumbnail) ||
      // fallback generik: ambil entry pertama dari object files
      pickFirst(Object.values(files || {})[0]);

    if (!candidate) {
      return res.status(400).json({ ok: false, error: "No file uploaded" });
    }

    // Upload via adapter:
    // - Vercel => Cloudinary (return secure URL)
    // - Lokal  => public/uploads/templates (return path /uploads/templates/xxx)
    const url = await uploadToStorage(candidate, "templates");

    return res.status(200).json({
      ok: true,
      message: "Upload berhasil",
      url,
    });
  } catch (error) {
    console.error("[templates/upload-thumbnail] error:", error?.message || error);
    return res.status(500).json({
      ok: false,
      error: error?.message || "Internal server error",
    });
  }
}
