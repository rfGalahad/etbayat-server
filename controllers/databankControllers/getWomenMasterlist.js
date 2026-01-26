import pool from '../../config/db.js';

export const getWomenMasterlist = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
          p.resident_id as residentId,
          CONCAT(
              p.last_name, ', ',
              p.first_name,
              IF(p.middle_name IS NOT NULL AND p.middle_name <> '', CONCAT(' ', p.middle_name), ''),
              IF(p.suffix IS NOT NULL AND p.suffix <> '', CONCAT(' ', p.suffix), '')
          ) AS fullName,
          DATE_FORMAT(p.birthdate, '%m-%d-%Y') as birthdate,
          pi.educational_attainment as educationalAttainment,
          pi.skills as skills,
          pi.occupation as occupation,
          h.barangay as barangay
      FROM population p
      INNER JOIN professional_information pi
          ON p.resident_id = pi.resident_id
      INNER JOIN family_information fi
          ON p.family_id = fi.family_id
      INNER JOIN households h
          ON fi.household_id = h.household_id
      WHERE p.sex = 'Female'
      AND TIMESTAMPDIFF(YEAR, p.birthdate, CURDATE()) BETWEEN 18 AND 59
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
    console.error('Error fetching women masterlist data:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching women masterlist data', 
      error: error.message 
    });
  }
}


