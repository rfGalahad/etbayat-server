import pool from '../../config/db.js';

export const getNonIvatanMasterlist = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
          p.resident_id AS residentId,
          CONCAT(
              p.last_name, ', ',
              p.first_name,
              IF(p.middle_name IS NOT NULL AND p.middle_name <> '', CONCAT(' ', p.middle_name), ''),
              IF(p.suffix IS NOT NULL AND p.suffix <> '', CONCAT(' ', p.suffix), '')
          ) AS fullName,
          DATE_FORMAT(p.birthdate, '%m-%d-%Y') AS birthdate,
          pi.educational_attainment AS educationalAttainment,
          pi.skills AS skills,
          pi.occupation AS occupation,
          h.barangay AS barangay
      FROM population p
      INNER JOIN social_classification sc
          ON p.resident_id = sc.resident_id
      INNER JOIN professional_information pi
          ON p.resident_id = pi.resident_id
      INNER JOIN family_information fi
          ON p.family_id = fi.family_id
      INNER JOIN households h
          ON fi.household_id = h.household_id
      WHERE sc.classification_code = 'IPULA'
      ORDER BY 
          p.last_name,
          p.first_name,
          p.middle_name,
          p.suffix;
    `);
    
    res.status(200).json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error fetching non-ivatan masterlist data:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching non-ivatan masterlist data', 
      error: error.message 
    });
  }
}


