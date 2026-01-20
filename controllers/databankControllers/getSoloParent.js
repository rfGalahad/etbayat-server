import pool from '../../config/db.js';

export const getSoloParent = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        p.resident_id,
        p.family_id,
        CONCAT(
            p.last_name, ', ',
            p.first_name,
            IFNULL(CONCAT(' ', p.middle_name), ''),
            IFNULL(CONCAT(' ', p.suffix), '')
        ) AS name,
        p.sex,
        DATE_FORMAT(p.birthdate, '%m-%d-%Y') AS birthdate,
        p.civil_status,
        p.religion,
        p.relation_to_family_head,
        p.birthplace,

        COALESCE(hi.barangay, ci.barangay) AS barangay,

        sc.classification_code,
        sc.classification_name,

        sp.solo_parent_id

      FROM population p
      LEFT JOIN family_information f ON f.family_id = p.family_id
      LEFT JOIN households hi ON f.household_id = hi.household_id
      LEFT JOIN contact_information ci ON p.resident_id = ci.resident_id
      JOIN social_classification sc ON p.resident_id = sc.resident_id
          AND sc.classification_code = 'SP'
      LEFT JOIN solo_parent_id_applications sp ON p.resident_id = sp.resident_id;
    `);
    
    res.status(200).json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error fetching solo parent data:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching solo parent data', 
      error: error.message 
    });
  }
}


