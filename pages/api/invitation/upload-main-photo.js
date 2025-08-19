import formidable from "formidable";
import fs from "fs";
import path from "path";
import dbConnect from "../../../lib/dbConnect";
import Invitation from "../../../models/Invitation";

// Disable bodyParser for file uploads
export const config = {
  api: { bodyParser: false }
};

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  try {
    // Create uploads directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), "public", "uploads", "main-photos");
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
      const [fields, files] = await form.parse(req);

      const file = Array.isArray(files.foto) ? files.foto[0] : files.foto;
      if (!file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const url = `/uploads/main-photos/${path.basename(file.filepath)}`;

      // Connect to database and update invitation
      await dbConnect();
      const slug = Array.isArray(fields.slug) ? fields.slug[0] : fields.slug;
      
      if (!slug) {
        return res.status(400).json({ error: "Slug is required" });
      }

      const invitation = await Invitation.findOne({ slug });
      if (!invitation) {
        return res.status(404).json({ error: "Invitation not found" });
      }

      // Delete old photo if exists
      if (invitation.main_photo) {
        const oldPath = path.join(process.cwd(), "public", invitation.main_photo);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }

      // Update invitation with new photo URL
      invitation.main_photo = url;
      await invitation.save();

      res.status(200).json({ url });
      
    } catch (parseError) {
      console.error('Form parse error:', parseError);
      res.status(500).json({ error: "Gagal memproses file" });
    }

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: "Gagal upload file" });
  }
}
