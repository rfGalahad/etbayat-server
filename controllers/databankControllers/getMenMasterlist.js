import pool from '../../config/db.js';

export const getMenMasterlist = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        p.resident_id AS residentId,
        CONCAT(
        p.last_name, ', ',
        p.first_name,
        IF(p.middle_name IS NOT NULL AND p.middle_name <> '', CONCAT(' ', p.middle_name), ''),
        IF(p.suffix IS NOT NULL AND p.suffix <> '', CONCAT(' ', p.suffix), '')
        ) AS name,
        DATE_FORMAT(p.birthdate, '%m-%d-%Y') AS birthdate,
        TIMESTAMPDIFF(YEAR, p.birthdate, CURDATE()) AS age,
        pi.educational_attainment AS educationalAttainment,
        pi.skills,
        pi.occupation AS occupation,
        h.barangay AS barangay,

        CASE
            -- SKILLED / WORKING
            WHEN pi.skills IS NOT NULL AND pi.skills <> ''
            AND pi.occupation IS NOT NULL AND pi.occupation <> ''
            THEN 'Skilled/Working'

            -- SKILLED / NON-WORKING
            WHEN pi.skills IS NOT NULL AND pi.skills <> ''
            AND (pi.occupation IS NULL OR pi.occupation = '')
            THEN 'Skilled/Non-Working'

            -- UNSKILLED / NON-WORKING
            WHEN (pi.skills IS NULL OR pi.skills = '')
            AND pi.occupation IS NOT NULL AND pi.occupation <> ''
            THEN 'Unskilled/Working'

            -- UNSKILLED / NON-WORKING
            ELSE 'Unskilled/Non-Working'
        END AS remarks

      FROM population p
      INNER JOIN professional_information pi
        ON p.resident_id = pi.resident_id
      INNER JOIN family_information fi
        ON p.family_id = fi.family_id
      INNER JOIN households h
        ON fi.household_id = h.household_id
      WHERE p.sex = 'Male'
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
    console.error('Error fetching men masterlist data:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching men masterlist data', 
      error: error.message 
    });
  }
}


