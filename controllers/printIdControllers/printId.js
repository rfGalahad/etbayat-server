import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getFilePath } from '../../utils/fileUtils.js';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


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

    // Build CSV — image URLs go directly, helper script handles downloading
    const csvHeader = 'Name,Disability,PwdIdNumber,PhotoId,Signature';
    const csvRow = [
      fullName,
      data.disabilityType || '',
      data.pwdId || '',
      data.photoUrl || '',
      data.signatureUrl || ''
    ].join(',');
    const csvContent = `${csvHeader}\n${csvRow}`;

    // Save ID card image as backup on VPS
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    const outputDir = path.join(__dirname, '../../public/id-cards');
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    const timestamp = Date.now();
    const sanitizedName = (data.lastName || 'ID').replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const imgFilename = `${sanitizedName}_${idType}_${timestamp}.png`;
    const csvFilename = `${sanitizedName}_${idType}_${timestamp}.txt`;
    fs.writeFileSync(path.join(outputDir, imgFilename), buffer);

    res.status(201).json({
      success: true,
      message: 'ID card ready for printing',
      data: {
        csvContent,
        csvFilename,
        imgFilename,
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