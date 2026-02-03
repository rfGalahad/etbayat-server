import pool from '../../config/db.js';

export const getYouthMasterlist = async (req, res) => {
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

          /* OCCUPATION RULE */
          CASE
              WHEN (pi.occupation IS NULL OR pi.occupation = 'None')
                  AND EXISTS (
                      SELECT 1
                      FROM social_classification sc2
                      WHERE sc2.resident_id = p.resident_id
                        AND sc2.classification_code = 'IS'
                  )
              THEN 'Student'
              ELSE pi.occupation
          END AS occupation,

          /* REMARKS (combined with /) */
          TRIM(BOTH '/' FROM CONCAT_WS('/',

              /* Working Youth (WY) */
              CASE
                  WHEN EXISTS (
                      SELECT 1 FROM social_classification sc
                      WHERE sc.resident_id = p.resident_id
                        AND sc.classification_code = 'WY'
                  )
                  THEN 'Working Youth'
              END,

              /* Non-Working Youth (NWY) */
              CASE
                  WHEN EXISTS (
                      SELECT 1 FROM social_classification sc
                      WHERE sc.resident_id = p.resident_id
                        AND sc.classification_code = 'NWY'
                  )
                  THEN 'Non-Working Youth'
              END,

              /* PWD */
              CASE
                  WHEN EXISTS (
                      SELECT 1 FROM social_classification sc
                      WHERE sc.resident_id = p.resident_id
                        AND sc.classification_code = 'PWD'
                  )
                  THEN 'PWD'
              END,

              /* OSY */
              CASE
                  WHEN EXISTS (
                      SELECT 1 FROM social_classification sc
                      WHERE sc.resident_id = p.resident_id
                        AND sc.classification_code = 'OSY'
                  )
                  THEN 'OSY'
              END,

              /* In School */
              CASE
                  WHEN EXISTS (
                      SELECT 1 FROM social_classification sc
                      WHERE sc.resident_id = p.resident_id
                        AND sc.classification_code = 'IS'
                  )
                  THEN 'In School'
              END
          )) AS remarks,


          h.barangay

      FROM population p
      JOIN family_information fi ON fi.family_id = p.family_id
      JOIN households h ON h.household_id = fi.household_id
      LEFT JOIN professional_information pi ON pi.resident_id = p.resident_id

      WHERE TIMESTAMPDIFF(YEAR, p.birthdate, CURDATE()) BETWEEN 15 AND 30
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


