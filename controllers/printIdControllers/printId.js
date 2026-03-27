import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const OUTPUT_DIR = path.join(__dirname, '../../public/id-cards');


// ─── CSV Builders ────────────────────────────────────────────────────────────

const buildPwdCsv = (data, fullName) => {
  const header = 'Name,Disability,PwdIdNumber,PhotoId,Signature';
  const row    = [
    fullName,
    data.disabilityType  || '',
    data.pwdId           || '',
    data.photoUrl        || '',
    data.signatureUrl    || '',
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
    data.photoUrl          || '',
    data.signatureUrl      || '',
    data.mayorName         || '',
    data.mayorSignature    || '',
    data.oscaHead          || '',
    data.oscaHeadSignature || '',
  ].join(',');

  return { header, row };
};

const buildSoloParentCsv = (data, fullName) => {
  const dependents = data.dependents || [];

  // Build header dynamically
  let header = 'Solo_Parent_Id_Number,Name,Date_Place_Of_Birth,Address,Solo_Parent_Category,Benefit_Qualification_Code';

  for (let i = 1; i <= 8; i++) {
    header += `,Name_${i},Age_${i},Birthdate_${i},Relationship_${i}`;
  }

  // Base row
  let row = [
    data.soloParentId || '',
    fullName,
    `${formatBirthdate(data.birthdate) || ''} ${clean(data.birthplace) || ''}`,
    data.address || '',
    data.category || '',
    data.benefitCode || ''
  ];

  // Add dependents
  for (let i = 0; i < 8; i++) {
    const d = dependents[i];

    if (d) {
      row.push(
        d.name || '',
        d.age || '',
        formatBirthdate(d.birthdate) || '',
        d.relationship || ''
      );
    } else {
      // Fill empty if no dependent
      row.push('', '', '', '');
    }
  }

  return {
    header,
    row: row.join(',')
  };
};

const CSV_BUILDERS = {
  pwd: buildPwdCsv,
  seniorCitizen: buildSeniorCitizenCsv,
  soloParent: buildSoloParentCsv,
};

 
// ─── Helpers ─────────────────────────────────────────────────────────────────

const clean = (val) => (val || '').replace(/,/g, '');
const safe = (val) => `"${val || ''}"`;
 
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

const ensureOutputDir = () => {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
};

const saveIdCardImage = (imageData, filename) => {
  const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
  const buffer     = Buffer.from(base64Data, 'base64');
  ensureOutputDir();
  fs.writeFileSync(path.join(OUTPUT_DIR, filename), buffer);
};


// ─── Controller ──────────────────────────────────────────────────────────────

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

    const data     = typeof applicantData === 'string' ? JSON.parse(applicantData) : applicantData;
    const fullName = buildFullName(data);
    const timestamp = Date.now();

    // Build CSV
    const { header, row } = buildCsv(data, fullName);
    const csvContent      = `${header}\n${row}`;

    // Save image backup to VPS
    const imgFilename = buildFilename(data.lastName, idType, timestamp, 'png');
    const csvFilename = buildFilename(data.lastName, idType, timestamp, 'txt');
    saveIdCardImage(imageData, imgFilename);

    return res.status(201).json({
      success: true,
      message: 'ID card ready for printing',
      data: {
        csvContent,
        csvFilename,
        imgFilename,
        idType,
        applicantName: fullName,
        timestamp,
      },
    });

  } catch (error) {
    console.error('Print ID Error:', error);
    next(error);
  }
};