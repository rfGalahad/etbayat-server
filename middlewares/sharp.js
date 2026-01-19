import sharp from 'sharp';
import path from 'path';
import fs from 'fs';


export const resizeImages = async (req, res, next) => {
  if (!req.file && !req.files) return next();

  try {
    /*
    if (!fs.existsSync('uploads')) {
      fs.mkdirSync('uploads');
    }
    */
   
    const processImage = async (file, options, prefix) => {
      const filename = `${prefix}-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}.jpg`;

      const outputPath = path.join('uploads', filename);

      await sharp(file.buffer)
        .rotate()
        .resize(options.resize)
        .jpeg({ quality: options.quality })
        .toFile(outputPath);

      return {
        ...file,
        filename,
        path: outputPath
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


