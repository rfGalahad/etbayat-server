import fs from 'fs/promises';
import path from 'path';

export const base64ToBuffer = (base64) => {
  const matches = base64.match(/^data:(.+);base64,(.+)$/);

  if (!matches) {
    throw new Error('Invalid base64 image');
  }

  return Buffer.from(matches[2], 'base64');
};

export const saveToLocal = async (buffer, folder, filename) => {
  try {
    // Define upload directory (adjust path as needed)
    const uploadDir = path.join(process.cwd(), 'uploads', folder);
    
    // Create directory if it doesn't exist
    await fs.mkdir(uploadDir, { recursive: true });
    
    // Generate unique filename with timestamp
    const timestamp = Date.now();
    const ext = path.extname(filename);
    const baseName = path.basename(filename, ext);
    const uniqueFilename = `${baseName}-${timestamp}${ext}`;
    
    // Full file path
    const filePath = path.join(uploadDir, uniqueFilename);
    
    // Write file to disk
    await fs.writeFile(filePath, buffer);
    
    // Return file info (similar structure to Cloudinary response)
    return {
      url: `/uploads/${folder}/${uniqueFilename}`,
      filePath: filePath,
      filename: uniqueFilename
    };
  } catch (error) {
    console.error('Error saving file to local storage:', error);
    throw error;
  }
};

export const deleteFromLocal = async (filePath) => {
  return fs.unlink(filePath).catch(err => {
    console.error(`Error deleting file ${filePath}:`, err);
  });
};

export const cleanupLocalStorageUploads = async ({ 
  photoId, 
  signature
}) => {
  try {
    const filesToDelete = [];

    // Collect all file paths that were successfully uploaded     
    if (photoId?.filePath) {
      filesToDelete.push(photoId.filePath);
    }
    
    if (signature?.filePath) {
      filesToDelete.push(signature.filePath);
    }

    // Delete all uploaded files from local storage
    if (filesToDelete.length > 0) {
      await Promise.all(filesToDelete.map(deleteFromLocal));
      console.log(`Cleaned up ${filesToDelete.length} files from local storage`);
    }
  } catch (error) {
    console.error('Error cleaning up local uploads:', error);
  }
};

export const getFileUrl = (filePath, req) => {
  if (!filePath) return null;
  const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
  return `${baseUrl}/uploads/${filePath}`;
};

export const getFileUrls = (files, req) => {
  return Object.entries(files).reduce((acc, [key, path]) => {
    acc[key] = getFileUrl(path, req);
    return acc;
  }, {});
};