import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getFilePath } from '../../utils/fileUtils.js';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const getImageBase64 = (url) => {
  try {
    if (!url) return null;

    const filePath = getFilePath(url);

    if (!fs.existsSync(filePath)) {
      console.warn(`Image file not found: ${filePath}`);
      return null;
    }

    const buffer = fs.readFileSync(filePath);
    const ext = path.extname(filePath).slice(1).toLowerCase() || 'png';
    return {
      base64: buffer.toString('base64'),
      mimeType: `image/${ext}`,
      filename: path.basename(filePath)
    };
  } catch (err) {
    console.warn('Failed to read image:', err.message);
    return null;
  }
};

export const printId = async (req, res, next) => {
  try {
    const { idType, applicantData, imageData } = req.body;

    if (!imageData || !idType) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const data = typeof applicantData === 'string'
      ? JSON.parse(applicantData)
      : applicantData;

    // Combine full name
    const fullName = [
      data.firstName,
      data.middleName,
      data.lastName,
      data.suffix
    ].filter(Boolean).join(' ').toUpperCase();

    const photo = getImageBase64(data.photoUrl);
    const signature = getImageBase64(data.signatureUrl);

    const csvHeader = 'Name,Disability,PwdIdNumber';
    const csvRow = [
      fullName,
      data.disabilityType,
      data.pwdId,
      photo ? `{PHOTO_PATH}` : '',       
      signature ? `{SIGNATURE_PATH}` : ''
    ].join(',');

    const csvContent = `${csvHeader}\n${csvRow}`;

    // Save CSV file
    const outputDir = path.join(__dirname, '../../public/id-cards');
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    const timestamp = Date.now();
    const sanitizedName = (data.lastName || 'ID').replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const csvFilename = `${sanitizedName}_${idType}_${timestamp}.txt`;
    const csvFilepath = path.join(outputDir, csvFilename);
    fs.writeFileSync(csvFilepath, csvContent);

    // Save image file as backup
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    const imgFilename = `${sanitizedName}_${idType}_${timestamp}.png`;
    fs.writeFileSync(path.join(outputDir, imgFilename), buffer);

    res.status(201).json({
      success: true,
      message: 'ID card ready for printing',
      data: {
        csvContent,        // ← send the raw CSV string
        csvFilename,
        imgFilename,
        imgPath: `/id-cards/${imgFilename}`,
        idType,
        applicantName: fullName,
        timestamp
      }
    });

  } catch (error) {
    console.error('Print ID Error:', error);
    next(error);
  }
};