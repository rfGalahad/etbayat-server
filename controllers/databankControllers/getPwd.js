import pool from '../../config/db.js';

export const getPwd = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
          p.resident_id AS residentId,
          CONCAT(
              p.last_name, ', ',
              p.first_name,
              IFNULL(CONCAT(' ', p.middle_name), ''),
              IFNULL(CONCAT(' ', p.suffix), '')
          ) AS name,

          DATE_FORMAT(p.birthdate, '%m-%d-%Y') AS birthdate,
          TIMESTAMPDIFF(YEAR, p.birthdate, CURDATE()) AS age,
          p.sex,
          pi.educational_attainment AS educationalAttainment,
          pi.skills,

          CASE
              WHEN pi.occupation IS NULL OR pi.occupation = 'None'
                  THEN 'Dependent'
              ELSE pi.occupation
          END AS occupation,

          hi.disability_type,
          sp.pwd_id AS pwdId,
          COALESCE(hi.barangay, ci.barangay) AS barangay

      FROM population p
      LEFT JOIN professional_information pi 
          ON pi.resident_id = p.resident_id
      LEFT JOIN health_information hi 
          ON hi.resident_id = p.resident_id
      LEFT JOIN family_information f 
          ON f.family_id = p.family_id
      LEFT JOIN households h 
          ON f.household_id = h.household_id
      LEFT JOIN contact_information ci 
          ON p.resident_id = ci.resident_id
      JOIN social_classification sc 
          ON p.resident_id = sc.resident_id
        AND sc.classification_code = 'PWD'
      LEFT JOIN pwd_id_applications sp 
          ON p.resident_id = sp.resident_id;
    `);
    
    res.status(200).json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error fetching pwd data:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching pwd data', 
      error: error.message 
    });
  }
}


