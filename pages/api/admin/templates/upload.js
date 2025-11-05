import fs from "fs";
import path from "path";
import formidable from "formidable";

export const config = {
  api: {
    bodyParser: false, // penting agar Formidable bisa handle form-data
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  try {
    // Pastikan direktori upload tersedia
    const uploadDir = path.join(process.cwd(), "public/images/templates");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Gunakan Promise agar async/await bisa dipakai
    const data = await new Promise((resolve, reject) => {
      const form = formidable({
        multiples: false,
        maxFileSize: 5 * 1024 * 1024, // 5MB
        uploadDir,
        keepExtensions: true,
      });

      form.parse(req, (err, fields, files) => {
        if (err) {
          console.error("Formidable error:", err);
          reject(err);
          return;
        }

        try {
          // Ambil file (handle kemungkinan array)
          const file =
            files.file?.[0] ||
            files.thumbnail?.[0] ||
            files.file ||
            files.thumbnail ||
            Object.values(files)[0];

          if (!file) {
            reject(new Error("No file uploaded"));
            return;
          }

          const ext = path.extname(file.originalFilename || "");
          const safeName = `${Date.now()}-${Math.random()
            .toString(36)
            .substring(2)}${ext}`;
          const finalPath = path.join(uploadDir, safeName);

          fs.renameSync(file.filepath, finalPath);

          const publicUrl = `/images/templates/${safeName}`;
          resolve({ ok: true, url: publicUrl });
        } catch (err2) {
          reject(err2);
        }
      });
    });

    return res.status(200).json({
      ok: true,
      message: "Upload berhasil",
      url: data.url,
    });
  } catch (error) {
    console.error("Upload API error:", error);
    return res.status(500).json({
      ok: false,
      error: error.message || "Internal server error",
    });
  }
}
