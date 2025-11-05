import formidable from "formidable";
import fs from "fs";
import path from "path";

export const config = {
  api: {
    bodyParser: false, // penting untuk upload file
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, message: "Method not allowed" });
  }

  try {
    // 📁 Buat folder tujuan upload
    const uploadDir = path.join(process.cwd(), "public/uploads/our-story");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // ⚙️ Konfigurasi Formidable
    const form = formidable({
      uploadDir,
      keepExtensions: true,
      maxFileSize: 5 * 1024 * 1024, // 5MB
      filename: (name, ext, part, form) => {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 8);
        const extension = path.extname(part.originalFilename || "");
        return `${timestamp}_${random}${extension}`;
      },
    });

    // Parsing form
    const [fields, files] = await form.parse(req);
    const file = files.file || files.photo;

    if (!file) {
      console.error("❌ Tidak ada file dikirim ke server.");
      return res.status(400).json({ ok: false, message: "Tidak ada file diunggah." });
    }

    const uploaded = Array.isArray(file) ? file[0] : file;

    const filePath = uploaded.filepath || uploaded.path;
    const filename = path.basename(filePath);
    const publicPath = `/uploads/our-story/${filename}`;

    console.log("✅ File berhasil diupload:", publicPath);

    return res.status(200).json({
      ok: true,
      message: "Foto berhasil diupload",
      path: publicPath,
    });
  } catch (error) {
    console.error("❌ Upload Our Story Error:", error);
    return res.status(500).json({
      ok: false,
      message: "Terjadi kesalahan saat mengupload foto",
      error: error.message,
    });
  }
}
