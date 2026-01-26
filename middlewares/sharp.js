import sharp from 'sharp';
import path from 'path';
import fs from 'fs';


export const resizeImages = async (req, res, next) => {
  if (!req.file && !req.files) return next();

  try {
   
    const processImage = async (file, options, prefix) => {
      const buffer = await sharp(file.buffer)
        .rotate()
        .resize(options.resize)
        .jpeg({ quality: options.quality })
        .toBuffer(); // ❌ no file written to disk

      return {
        ...file,
        buffer,              // updated resized image buffer
        size: buffer.length, // optional
      };
    };


    /* ---------- SINGLE FILE (upload.single) ---------- */

    // THUMBNAIL IMAGE
    if (req.file) {
      req.file = await processImage(
        req.file,
        { resize: { width: 1200 }, quality: 75 },
        'thumbnailImage'
      );
    }

    /* ---------- MULTIPLE / FIELDS ---------- */

    // HOUSE IMAGES
    if (req.files?.houseImages) {
      req.files.houseImages = await Promise.all(
        req.files.houseImages.map(file =>
          processImage(
            file, 
            { resize: { width: 1024 }, quality: 70 }, 
            'house'
          )
        )
      );
    }

    // RESPONDENT PHOTO
    if (req.files?.respondentPhoto) {
      req.files.respondentPhoto = [
        await processImage(
          req.files.respondentPhoto[0],
          { resize: { width: 600 }, quality: 70 },
          'photo'
        )
      ];
    }

    // RESPONDENT SIGNATURE
    if (req.files?.respondentSignature) {
      req.files.respondentSignature = [
        await processImage(
          req.files.respondentSignature[0],
          { resize: { width: 400 }, quality: 90 },
          'signature'
        )
      ];
    }


    if (req.files?.pwdIdPhotoId) {
      req.files.pwdIdPhotoId = [
        await processImage(
          req.files.pwdIdPhotoId[0],
          { resize: { width: 600 }, quality: 70 },
          'pwdPhotoId'
        )
      ];
    }

    next();
  } catch (err) {
    next(err);
  }
};


