import cloudinary from '../config/cloudinary.js';
import { Readable } from 'stream';

const sanitizeFilename = (name) => {
  return name
    .replace(/\.[^/.]+$/, '') // remove extension
    .toLowerCase()
    .replace(/&/g, 'and') // optional
    .replace(/[^a-z0-9-_]/g, '-') // replace invalid chars
    .replace(/-+/g, '-') // remove duplicate dashes
    .replace(/^-|-$/g, ''); // trim dashes
};

export const uploadToCloudinary = (buffer, folder, filename) => {
  return new Promise((resolve, reject) => {
    const safeName = sanitizeFilename(filename);

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        public_id: `${Date.now()}-${safeName}`,
        resource_type: 'auto',
        transformation: [
          { quality: 'auto:good' },
          { fetch_format: 'auto' }
        ]
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve({
            url: result.secure_url,
            publicId: result.public_id
          });
        }
      }
    );

    const readableStream = Readable.from(buffer);
    readableStream.pipe(uploadStream);
  });
};

export const uploadMultipleToCloudinary = async (files, folder) => {
  if (!files || files.length === 0) return [];
  
  const uploadPromises = files.map(file => 
    uploadToCloudinary(file.buffer, folder, file.originalname)
  );
  
  return await Promise.all(uploadPromises);
};

export const deleteFromCloudinary = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
    console.log(`Deleted image: ${publicId}`);
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw error;
  }
};

export const deleteMultipleFromCloudinary = async (publicIds) => {
  if (!publicIds || publicIds.length === 0) return;
  
  const deletePromises = publicIds.map(id => deleteFromCloudinary(id));
  await Promise.all(deletePromises);
};

export const cleanupCloudinaryUploads = async ({ 
  houseImages, 
  respondentPhoto, 
  respondentSignature 
}) => {
  try {
    const publicIdsToDelete = [];

    if (houseImages?.length > 0) {
      publicIdsToDelete.push(...houseImages.map(img => img.publicId));
    }
    if (respondentPhoto?.publicId) {
      publicIdsToDelete.push(respondentPhoto.publicId);
    }
    if (respondentSignature?.publicId) {
      publicIdsToDelete.push(respondentSignature.publicId);
    }

    if (publicIdsToDelete.length > 0) {
      await deleteMultipleFromCloudinary(publicIdsToDelete);
      console.log(`🧹 Cleaned up ${publicIdsToDelete.length} images from Cloudinary`);
    }
  } catch (error) {
    console.error('Error cleaning up Cloudinary uploads:', error);
  }
}
