// utils/cloudinaryUpload.js
import cloudinary from '../config/cloudinary.js';
import { Readable } from 'stream';

/**
 * Upload image buffer to Cloudinary
 * @param {Buffer} buffer - Image buffer
 * @param {string} folder - Cloudinary folder name
 * @param {string} filename - Original filename
 * @returns {Promise<{url: string, publicId: string}>} - Cloudinary URL and public_id
 */

export const uploadToCloudinary = (buffer, folder, filename) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        public_id: `${Date.now()}-${filename}`,
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

/**
 * Upload multiple images to Cloudinary
 * @param {Array} files - Array of file objects
 * @param {string} folder - Cloudinary folder name
 * @returns {Promise<Array<{url: string, publicId: string}>>} - Array of Cloudinary URLs and public_ids
 */

export const uploadMultipleToCloudinary = async (files, folder) => {
  if (!files || files.length === 0) return [];
  
  const uploadPromises = files.map(file => 
    uploadToCloudinary(file.buffer, folder, file.originalname)
  );
  
  return await Promise.all(uploadPromises);
};


/**
 * Delete image from Cloudinary
 * @param {string} publicId - Cloudinary public_id
 * @returns {Promise<void>}
 */
export const deleteFromCloudinary = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
    console.log(`Deleted image: ${publicId}`);
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw error;
  }
};

/**
 * Delete multiple images from Cloudinary
 * @param {Array<string>} publicIds - Array of Cloudinary public_ids
 * @returns {Promise<void>}
 */
export const deleteMultipleFromCloudinary = async (publicIds) => {
  if (!publicIds || publicIds.length === 0) return;
  
  const deletePromises = publicIds.map(id => deleteFromCloudinary(id));
  await Promise.all(deletePromises);
};