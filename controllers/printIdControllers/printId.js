import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ─── CSV Builders ────────────────────────────────────────────────────────────

const buildPwdCsv = (data, fullName) => {
  const header = 'Name,Disability,PwdIdNumber,PhotoId,Signature';
  const row    = [
    fullName,
    data.disabilityType  || '',
    data.pwdId           || '',
    '{PHOTO_PATH}',
    '{SIGNATURE_PATH}',
  ].join(',');

  return { header, row };
};

const buildSeniorCitizenCsv = (data, fullName) => {
  const header = 'Name,Birthdate,Sex,SeniorCitizenId,PhotoId,Signature,MayorName,MayorSignature,OscaHead,OscaHeadSignature';
  const row    = [
    fullName,
    formatBirthdate(data.birthdate),
    data.sex               || '',
    data.seniorCitizenId   || '',
    '{PHOTO_PATH}',
    '{SIGNATURE_PATH}',
    data.mayorName         || '',
    data.mayorSignature    || '',
    data.oscaHead          || '',
    data.oscaHeadSignature || '',
  ].join(',');

  return { header, row };
};

const buildSoloParentCsv = (data, fullName) => {
  const dependents = data.dependents || [];

  let header = 'Solo_Parent_Id_Number,Photo_Id,Signature,Name,Date_Place_Of_Birth,Address,Solo_Parent_Category,Benefit_Qualification_Code';

  for (let i = 1; i <= 8; i++) {
    header += `,Name_${i},Age_${i},Birthdate_${i},Relationship_${i}`;
  }

  let row = [
    data.soloParentId || '',
    '{PHOTO_PATH}',
    '{SIGNATURE_PATH}',
    fullName,
    `${formatBirthdate(data.birthdate) || ''} ${clean(data.birthplace) || ''}`,
    data.address || '',
    data.category || '',
    data.benefitCode || ''
  ];

  for (let i = 0; i < 8; i++) {
    const d = dependents[i];
    if (d) {
      row.push(d.name || '', d.age || '', formatBirthdate(d.birthdate) || '', d.relationship || '');
    } else {
      row.push('', '', '', '');
    }
  }

  return { header, row: row.join(',') };
};

const CSV_BUILDERS = {
  pwd: buildPwdCsv,
  seniorCitizen: buildSeniorCitizenCsv,
  soloParent: buildSoloParentCsv,
};


// ─── Helpers ─────────────────────────────────────────────────────────────────

const clean = (val) => (val || '').replace(/,/g, '');

const formatBirthdate = (dateStr) => {
  if (!dateStr) return '';
  const [month, day, year] = dateStr.split('-');
  const months = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December'
  ];
  return `${months[parseInt(month, 10) - 1]} ${parseInt(day, 10)} ${year}`;
};

const buildFullName = ({ firstName, middleName, lastName, suffix }) =>
  [firstName, middleName, lastName, suffix]
    .filter(Boolean)
    .join(' ')
    .toUpperCase();

const buildFilename = (lastName, idType, timestamp, ext) => {
  const sanitized = (lastName || 'ID').replace(/[^a-z0-9]/gi, '_').toLowerCase();
  return `${sanitized.toUpperCase()}_${idType}.${ext}`;
};

/**
 * Converts a URL like http://localhost:3000/uploads/path/to/file.png
 * into an absolute file path on disk, then returns { data, mimeType }.
 * Returns null if the file doesn't exist or the URL can't be resolved.
 */


const urlToBase64 = (url, uploadsRoot) => {
  if (!url) return null;

  try {
    // Strip origin (http://localhost:3000) to get the URL path
    const urlPath = url.replace(/^https?:\/\/[^/]+/, '');

    // Strip leading /uploads/ prefix — adjust if your static mount differs
    const relativePath = urlPath.replace(/^\/uploads\//, '');

    const absolutePath = path.join(uploadsRoot, relativePath);

    if (!fs.existsSync(absolutePath)) {
      console.warn(`[printId] File not found on disk: ${absolutePath}`);
      return null;
    }

    const buffer   = fs.readFileSync(absolutePath);
    const ext      = path.extname(absolutePath).toLowerCase().replace('.', '');
    const mimeType = ext === 'jpg' ? 'image/jpeg' : `image/${ext || 'png'}`;

    return { data: buffer.toString('base64'), mimeType };
  } catch (err) {
    console.error(`[printId] Failed to read file for URL ${url}:`, err.message);
    return null;
  }
};


// ─── Controller ──────────────────────────────────────────────────────────────

// Absolute path to your uploads folder on the VPS.
// Adjust this to wherever Express serves /uploads from.

const __dirname    = path.dirname(fileURLToPath(import.meta.url));
const UPLOADS_ROOT = path.join(__dirname, '..', '..', 'uploads');   // ← adjust if needed

export const printId = async (req, res, next) => {
  try {
    const { idType, applicantData, imageData } = req.body;

    if (!imageData || !idType) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const buildCsv = CSV_BUILDERS[idType];
    if (!buildCsv) {
      return res.status(400).json({ success: false, message: `Unsupported idType: ${idType}` });
    }

    const data      = typeof applicantData === 'string' ? JSON.parse(applicantData) : applicantData;
    const fullName  = buildFullName(data);
    const timestamp = Date.now();

    // ── Read image files from disk and encode as base64 ──────────────────────
    const photo     = urlToBase64(data.photoUrl,     UPLOADS_ROOT);
    const signature = urlToBase64(data.signatureUrl, UPLOADS_ROOT);

    // ── Build CSV with placeholders ──────────────────────────────────────────
    const { header, row } = buildCsv(data, fullName);
    const csvContent      = `${header}\n${row}`;

    const csvFilename = buildFilename(data.lastName, idType, timestamp, 'txt');
    const imgFilename = buildFilename(data.lastName, idType, timestamp, 'png');

    return res.status(201).json({
      success: true,
      message: 'ID card ready for printing',
      data: {
        csvContent,   // still contains {PHOTO_PATH} and {SIGNATURE_PATH}
        csvFilename,
        imgFilename,
        idType,
        applicantName: fullName,
        timestamp,
        photo,        // { data: '<base64>', mimeType: 'image/png' } | null
        signature,    // { data: '<base64>', mimeType: 'image/png' } | null
      },
    });

  } catch (error) {
    console.error('Print ID Error:', error);
    next(error);
  }
};