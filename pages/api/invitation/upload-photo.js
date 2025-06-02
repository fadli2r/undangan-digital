import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Ensure upload directory exists
    const uploadDir = path.join(process.cwd(), 'public/uploads/photos');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const form = formidable({
      uploadDir: uploadDir,
      keepExtensions: true,
      maxFileSize: 5 * 1024 * 1024, // 5MB
      filename: (name, ext, part, form) => {
        // Generate unique filename
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 15);
        return `${timestamp}_${randomString}${ext}`;
      }
    });

    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) {
          console.error('Form parse error:', err);
          reject(err);
        } else {
          resolve([fields, files]);
        }
      });
    });

    console.log('Files received:', files);

    const file = files.photo;
    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Handle both single file and array of files
    const uploadedFile = Array.isArray(file) ? file[0] : file;
    console.log('Uploaded file:', uploadedFile);
    
    if (!uploadedFile.filepath && !uploadedFile.path) {
      console.error('No file path found in:', uploadedFile);
      return res.status(400).json({ message: 'File path not found' });
    }

    // Get the file path
    const filePath = uploadedFile.filepath || uploadedFile.path;
    console.log('File path:', filePath);
    
    // Get the filename from the path
    const filename = path.basename(filePath);
    
    // Return the path that can be used in <img src="...">
    const publicPath = `/uploads/photos/${filename}`;
    console.log('Public path:', publicPath);

    return res.status(200).json({
      path: publicPath,
      filename: filename
    });
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ 
      message: 'Error uploading file', 
      error: error.message 
    });
  }
}
