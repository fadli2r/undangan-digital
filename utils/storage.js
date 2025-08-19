import fs from 'fs';
import path from 'path';

/**
 * Upload file to local storage
 * @param {Object} file - File object from formidable
 * @param {string} folder - Folder name to store the file (e.g., 'main-photos', 'background-photos')
 * @returns {Promise<string>} URL of the uploaded file
 */
export async function uploadToStorage(file, folder) {
  try {
    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', folder);
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const originalName = file.originalFilename || 'uploaded-file';
    const extension = path.extname(originalName);
    const filename = `${timestamp}${extension}`;
    
    // Copy file to uploads directory
    const oldPath = file.filepath;
    const newPath = path.join(uploadsDir, filename);
    
    await fs.promises.copyFile(oldPath, newPath);
    
    // Clean up temp file
    await fs.promises.unlink(oldPath);
    
    // Return public URL
    return `/uploads/${folder}/${filename}`;
  } catch (error) {
    console.error('Storage error:', error);
    throw new Error('Failed to upload file');
  }
}

/**
 * Delete file from local storage
 * @param {string} url - Public URL of the file
 * @returns {Promise<void>}
 */
export async function deleteFromStorage(url) {
  try {
    if (!url) return;
    
    // Convert public URL to file path
    const filePath = path.join(process.cwd(), 'public', url);
    
    // Check if file exists
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
    }
  } catch (error) {
    console.error('Delete error:', error);
    throw new Error('Failed to delete file');
  }
}
