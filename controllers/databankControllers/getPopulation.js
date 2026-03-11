import pool from '../../config/db.js';

export const getPopulation = async (req, res) => {
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

        p.sex,
        DATE_FORMAT(p.birthdate, '%m-%d-%Y') AS birthdate,

        CASE 
          WHEN EXISTS (
            SELECT 1 
            FROM social_classification sc 
            WHERE sc.resident_id = p.resident_id
            AND sc.classification_code = 'PWD'
          ) THEN TRUE
          ELSE FALSE
        END AS isPwd,

        CASE 
          WHEN EXISTS (
            SELECT 1 
            FROM social_classification sc 
            WHERE sc.resident_id = p.resident_id
            AND sc.classification_code = 'SP'
          ) THEN TRUE
          ELSE FALSE
        END AS isSoloParent,

        CASE 
          WHEN EXISTS (
            SELECT 1 
            FROM social_classification sc 
            WHERE sc.resident_id = p.resident_id
            AND sc.classification_code = 'OT'
          ) THEN TRUE
          ELSE FALSE
        END AS isOutOfTown,

        CASE 
          WHEN EXISTS (
            SELECT 1 
            FROM social_classification sc 
            WHERE sc.resident_id = p.resident_id
            AND sc.classification_code = 'OFW'
          ) THEN TRUE
          ELSE FALSE
        END AS isOfw,

        CASE 
          WHEN EXISTS (
            SELECT 1 
            FROM social_classification sc 
            WHERE sc.resident_id = p.resident_id
            AND sc.classification_code = 'IPULA'
          ) THEN TRUE
          ELSE FALSE
        END AS isNonIvatan,

        CASE
          WHEN p.verified_birthdate = 1 
          THEN TRUE
          ELSE FALSE
        END AS verifiedBirthdate,

        p.specify_id as specifyId,
        hi.barangay
        
      FROM population p
      JOIN family_information fi ON p.family_id = fi.family_id
      JOIN households hi ON fi.household_id = hi.household_id
      WHERE p.resident_id LIKE 'RID%'
      ORDER BY name ASC;
    `);
    
    res.status(200).json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error fetching population data:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching population data', 
      error: error.message 
    });
  }
}


