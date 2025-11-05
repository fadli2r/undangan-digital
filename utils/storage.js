import fs from 'fs';
import path from 'path';
import { v2 as cloudinary } from 'cloudinary';

// ---------------------------
// Mode penentuan driver
// ---------------------------
// Cloudinary aktif jika ada CLOUDINARY_URL atau trio CLOUDINARY_*.
// Di Vercel (production) ini akan true, di lokal bisa false (fallback ke disk).
function isCloudinaryEnabled() {
  return !!(
    process.env.CLOUDINARY_URL ||
    (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET)
  );
}

// Init Cloudinary sekali
function initCloudinary() {
  if (process.env.CLOUDINARY_URL) {
    cloudinary.config({ secure: true });
  } else {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    });
  }
}

// Ambil public_id dari URL Cloudinary
// Contoh URL: https://res.cloudinary.com/<cloud>/image/upload/v12345/dreamslink/galeri/INV123/abc.png
// public_id => dreamslink/galeri/INV123/abc
function publicIdFromUrl(url) {
  try {
    const u = new URL(url);
    const m = u.pathname.match(/\/upload\/(?:v\d+\/)?(.+?)(\.[A-Za-z0-9]+)?$/);
    return m && m[1] ? m[1] : null;
  } catch {
    return null;
  }
}

/**
 * Upload file (Cloudinary di Vercel, local disk saat dev)
 * @param {Object} file - File object dari formidable (punya .filepath dan .originalFilename)
 * @param {string} folder - subfolder (mis. 'galeri', 'main-photos', dll)
 * @returns {Promise<string>} URL public file
 */
export async function uploadToStorage(file, folder) {
  try {
    // SAFETY: pastikan properti ada
    const tmpPath = file?.filepath;
    const originalName = file?.originalFilename || 'uploaded-file';
    if (!tmpPath) throw new Error('File tmp path not found');

    // ---- Production/Cloud: pakai Cloudinary ----
    if (isCloudinaryEnabled()) {
      initCloudinary();

      // folder bebas kamu tentukan; contoh: "dreamslink/<folder>"
      const cloudFolder = `dreamslink/${folder}`; 
      const result = await cloudinary.uploader.upload(tmpPath, {
        folder: cloudFolder,
        resource_type: 'image', // ganti 'auto' jika ingin dukung video/pdf
        use_filename: true,
        unique_filename: true,
        overwrite: false,
        transformation: [{ quality: 'auto', fetch_format: 'auto' }],
      });

      // Bersihkan file temp kalau ada
      try { await fs.promises.unlink(tmpPath); } catch {}

      return result.secure_url; // simpan URL ini ke MongoDB
    }

    // ---- Dev/Lokal: tulis ke public/uploads/<folder> ----
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', folder);
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const timestamp = Date.now();
    const ext = path.extname(originalName) || path.extname(tmpPath) || '';
    const filename = `${timestamp}${ext}`;
    const newPath = path.join(uploadsDir, filename);

    await fs.promises.copyFile(tmpPath, newPath);
    try { await fs.promises.unlink(tmpPath); } catch {}

    // URL publik lokal
    return `/uploads/${folder}/${filename}`;
  } catch (error) {
    console.error('Storage upload error:', error);
    throw new Error('Failed to upload file');
  }
}

/**
 * Hapus file (Cloudinary di Vercel, hapus file lokal saat dev)
 * @param {string} url - URL public file
 */
export async function deleteFromStorage(url) {
  try {
    if (!url) return;

    // Cloudinary: gunakan public_id dari URL
    if (isCloudinaryEnabled()) {
      initCloudinary();
      const publicId = publicIdFromUrl(url);
      if (publicId) {
        try { await cloudinary.uploader.destroy(publicId); } catch (e) {
          // jika bukan image (mis video), bisa pakai resource_type: 'video'
          // await cloudinary.uploader.destroy(publicId, { resource_type: 'video' });
          console.warn('Cloudinary destroy warning:', e?.message || e);
        }
      }
      return;
    }

    // Lokal: hapus file dari public
    const filePath = path.join(process.cwd(), 'public', url.replace(/^\/+/, ''));
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
    }
  } catch (error) {
    console.error('Storage delete error:', error);
    throw new Error('Failed to delete file');
  }
}
