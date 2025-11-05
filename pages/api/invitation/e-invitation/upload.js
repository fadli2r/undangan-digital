// pages/api/invitation/e-invitation/upload.js
import formidable from "formidable";
import fs from "fs";
import path from "path";

export const config = {
  api: {
    bodyParser: false, // penting untuk formidable
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const uploadDir = path.join(process.cwd(), "public/uploads/einvitation");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const form = formidable({
      uploadDir,
      keepExtensions: true,
      maxFileSize: 5 * 1024 * 1024, // 5MB
      filename: (name, ext, part, form) => {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 10);
        return `${timestamp}_${random}${ext}`;
      },
    });

    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve([fields, files]);
      });
    });

    const file = files.cover;
    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const uploaded = Array.isArray(file) ? file[0] : file;
    const filePath = uploaded.filepath || uploaded.path;
    const filename = path.basename(filePath);
    const publicPath = `/uploads/einvitation/${filename}`;

    return res.status(200).json({
      success: true,
      path: publicPath,
      filename,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return res
      .status(500)
      .json({ message: "Upload error", error: error.message });
  }
}
