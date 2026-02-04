import pool from '../../config/db.js';

export const getOsyMasterlist = async (req, res) => {
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
          pi.occupation,

          CASE
              WHEN EXISTS (
                  SELECT 1
                  FROM social_classification sc
                  WHERE sc.resident_id = p.resident_id
                    AND sc.classification_code = 'PWD'
              )
              THEN 'PWD'
          END AS remarks,

          af.organization_name AS organizationName,

          -- Parent / Guardian (Family Head)
          CONCAT(
              pg.last_name, ', ',
              pg.first_name,
              IFNULL(CONCAT(' ', pg.middle_name), ''),
              IFNULL(CONCAT(' ', pg.suffix), '')
          ) AS parentGuardianName,

          h.barangay

      FROM population p
      JOIN family_information fi ON fi.family_id = p.family_id
      JOIN households h ON h.household_id = fi.household_id

      LEFT JOIN population pg
          ON pg.family_id = p.family_id
        AND pg.relation_to_family_head = 'Family Head'

      LEFT JOIN professional_information pi ON pi.resident_id = p.resident_id
      LEFT JOIN affiliation af ON af.resident_id = p.resident_id

      WHERE TIMESTAMPDIFF(YEAR, p.birthdate, CURDATE()) BETWEEN 15 AND 30

      -- 🔹 OSY filter
      AND EXISTS (
          SELECT 1
          FROM social_classification sc
          WHERE sc.resident_id = p.resident_id
            AND sc.classification_code = 'OSY'
      )

      ORDER BY h.barangay, p.last_name, p.first_name;
    `);
    
    res.status(200).json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error fetching masterlist data:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching masterlist data', 
      error: error.message 
    });
  }
}


