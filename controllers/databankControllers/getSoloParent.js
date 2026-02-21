import pool from '../../config/db.js';

export const getSoloParent = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
          r.resident_id AS residentId,
          fam.family_id as familyId,

          /* Parent full name (same for all rows in the family) */
          CONCAT_WS(' ',
              parent.first_name,
              parent.middle_name,
              parent.last_name,
              parent.suffix
          ) AS parentName,

          /* Resident (parent or child) name */
          CASE
              WHEN r.relation_to_family_head <> 'Family Head'
              AND TIMESTAMPDIFF(YEAR, r.birthdate, CURDATE()) <= 22
              THEN CONCAT_WS(' ',
                  r.first_name,
                  r.middle_name,
                  r.last_name,
                  r.suffix
              )
              ELSE NULL
          END AS childName,

          DATE_FORMAT(r.birthdate, '%m-%d-%Y') AS birthdate,
          TIMESTAMPDIFF(YEAR, r.birthdate, CURDATE()) AS age,
          r.sex,

          pi.educational_attainment as educationalAttainment,
          pi.occupation,

          sp.solo_parent_id as soloParentId,
          h.barangay,

          /* So parent appears first */
          CASE
              WHEN r.relation_to_family_head = 'Family Head' THEN 0
              ELSE 1
          END AS sort_order

      FROM social_classification sc
      JOIN population r
          ON sc.resident_id = r.resident_id

      /* Get the FAMILY HEAD (parent) */
      JOIN population parent
          ON parent.family_id = r.family_id
        AND parent.relation_to_family_head = 'Family Head'

      JOIN family_information fam
          ON fam.family_id = r.family_id

      JOIN households h
          ON h.household_id = fam.household_id

      LEFT JOIN professional_information pi
          ON pi.resident_id = r.resident_id

      LEFT JOIN solo_parent_id_applications sp
          ON sp.resident_id = parent.resident_id

      WHERE sc.classification_code = 'SP'

      ORDER BY
          fam.family_id,
          sort_order,
          r.birthdate;
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


