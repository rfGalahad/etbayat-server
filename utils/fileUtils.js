import fs from 'fs/promises';
import path from 'path';

export const base64ToBuffer = (base64) => {
  const matches = base64.match(/^data:(.+);base64,(.+)$/);

  if (!matches) {
    throw new Error('Invalid base64 image');
  }

  return Buffer.from(matches[2], 'base64');
};

export const saveToLocal = async (buffer, folder, filename, mimetype = null) => {
  try {
    const uploadDir = path.join(process.cwd(), 'uploads', folder);
    
    await fs.mkdir(uploadDir, { recursive: true });
    
    const ext = mimetype 
      ? '.' + mimetype.split('/')[1]  // from mimetype e.g. 'image/jpeg' → '.jpeg'
      : path.extname(filename);        // fallback to filename extension e.g. '.png'
    const baseName = path.basename(filename, path.extname(filename));
    const uniqueFilename = `${baseName}${ext}`;
    
    const filePath = path.join(uploadDir, uniqueFilename);
    
    await fs.writeFile(filePath, buffer);
    
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
  try {
    const cleanedPath = filePath.startsWith('/')
      ? filePath.slice(1)
      : filePath;
    const absolutePath = path.join(process.cwd(), cleanedPath);
    await fs.unlink(absolutePath);
  } catch (err) {
    console.error(`Error deleting file ${filePath}:`, err);
  }
};

export const cleanupLocalStorageUploads = async ({ 
  photoId, 
  signature
}) => {
  try {
    const filesToDelete = [];

    if (photoId) filesToDelete.push(photoId);
    if (signature) filesToDelete.push(signature);

    if (filesToDelete.length > 0) {
      await Promise.all(filesToDelete.map(deleteFromLocal));
      console.log(`Cleaned up ${filesToDelete.length} files from local storage`);
    }
  } catch (error) {
    console.error('Error cleaning up local uploads:', error);
  }
};

export const getFilePath = (fileUrl) => {
  if (!fileUrl) return null;
  const url = new URL(fileUrl);
  // Converts '/uploads/pwd-id-applications/photo-id/photo-id-123.png'
  // to an absolute path on disk
  return path.join(process.cwd(), 'public', url.pathname);
};

export const getFileUrl = (filePath, req) => {
  if (!filePath) return null;
  const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
  return `${baseUrl}${filePath}`;
};

export const getFileUrls = (files, req) => {
  return Object.entries(files).reduce((acc, [key, path]) => {
    acc[key] = getFileUrl(path, req);
    return acc;
  }, {});
};