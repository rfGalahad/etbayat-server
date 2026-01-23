import pool from '../../config/db.js';

export const getSeniorCitizenMasterlist = async (req, res) => {
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
      INNER JOIN professional_information pi
          ON p.resident_id = pi.resident_id
      INNER JOIN family_information fi
          ON p.family_id = fi.family_id
      INNER JOIN households h
          ON fi.household_id = h.household_id
      WHERE TIMESTAMPDIFF(YEAR, p.birthdate, CURDATE()) >= 60
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
    console.error('Error fetching senior citizen masterlist data:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching senior citizen masterlist data', 
      error: error.message 
    });
  }
}


