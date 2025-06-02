import formidable from "formidable";
import fs from "fs";
import path from "path";

// Disable bodyParser for file uploads
export const config = {
  api: { bodyParser: false }
};

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  try {
    // Create uploads directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), "public", "uploads", "galeri");
    fs.mkdirSync(uploadDir, { recursive: true });

    const form = formidable({
      uploadDir,
      keepExtensions: true,
      maxFileSize: 2 * 1024 * 1024, // 2MB
      filter: function ({name, originalFilename, mimetype}) {
        // Accept only images
        return mimetype && mimetype.includes("image");
      }
    });

    try {
      const [fields, files] = await new Promise((resolve, reject) => {
        form.parse(req, (err, fields, files) => {
          if (err) reject(err);
          resolve([fields, files]);
        });
      });

      const uploadedFiles = Array.isArray(files.foto) ? files.foto : [files.foto];
      const urls = uploadedFiles
        .filter(Boolean) // Filter out null/undefined
        .map(file => `/uploads/galeri/${path.basename(file.filepath)}`);

      console.log('Files uploaded:', urls);
      res.status(200).json({ urls });
      
    } catch (parseError) {
      console.error('Form parse error:', parseError);
      res.status(500).json({ error: "Gagal memproses file" });
    }

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: "Gagal upload file" });
  }
}
