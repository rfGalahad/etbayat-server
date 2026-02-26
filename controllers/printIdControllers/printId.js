import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const printId = async (req, res, next) => {
  try {
    const { idType, applicantData, imageData } = req.body;

    // Validate required fields
    if (!imageData) {
      return res.status(400).json({
        success: false,
        message: 'Image data is required'
      });
    }

    if (!idType) {
      return res.status(400).json({
        success: false,
        message: 'ID type is required'
      });
    }

    // Parse applicant data if it's a string
    const parsedData = typeof applicantData === 'string' 
      ? JSON.parse(applicantData) 
      : applicantData;

    // Remove base64 header (data:image/png;base64,)
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    // Create directory for ID images if it doesn't exist
    const outputDir = path.join(__dirname, '../../public/id-cards');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const sanitizedName = (parsedData.name || 'ID')
      .replace(/[^a-z0-9]/gi, '_')
      .toLowerCase();
    const filename = `${sanitizedName}_${idType}_${timestamp}.png`;
    const filepath = path.join(outputDir, filename);

    // Save the image
    fs.writeFileSync(filepath, buffer);

    // Optional: Copy to SMART IDesigner hot folder if configured
    const smartHotFolder = process.env.SMART_HOT_FOLDER;
    if (smartHotFolder && fs.existsSync(smartHotFolder)) {
      const smartFilepath = path.join(smartHotFolder, filename);
      fs.copyFileSync(filepath, smartFilepath);
      console.log(`Copied to SMART hot folder: ${smartFilepath}`);
    }

    res.status(201).json({
      success: true,
      message: 'ID card generated successfully',
      data: {
        filename,
        filepath: `/id-cards/${filename}`,
        idType,
        applicantName: parsedData.name,
        timestamp
      }
    });

  } catch (error) {
    console.error('Print ID Error:', error);
    next(error);
  }
};