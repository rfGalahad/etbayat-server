import pool from '../../config/db.js';

export const getHousehold = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
          h.household_id AS householdId,

          CASE
            WHEN h.multiple_family = FALSE THEN
              CONCAT(
                  MAX(CASE WHEN p.relation_to_family_head = 'Family Head' THEN p.last_name END), ', ',
                  MAX(CASE WHEN p.relation_to_family_head = 'Family Head' THEN p.first_name END),
                  IF(
                      MAX(CASE WHEN p.relation_to_family_head = 'Family Head' THEN p.middle_name END) IS NOT NULL
                      AND MAX(CASE WHEN p.relation_to_family_head = 'Family Head' THEN p.middle_name END) <> '',
                      CONCAT(' ', MAX(CASE WHEN p.relation_to_family_head = 'Family Head' THEN p.middle_name END)),
                      ''
                  ),
                  IF(
                      MAX(CASE WHEN p.relation_to_family_head = 'Family Head' THEN p.suffix END) IS NOT NULL
                      AND MAX(CASE WHEN p.relation_to_family_head = 'Family Head' THEN p.suffix END) <> '',
                      CONCAT(' ', MAX(CASE WHEN p.relation_to_family_head = 'Family Head' THEN p.suffix END)),
                      ''
                  )
              )
            ELSE
              CONCAT(
                  h.family_head_last_name, ', ',
                  h.family_head_first_name,
                  IF(h.family_head_middle_name IS NOT NULL AND h.family_head_middle_name <> '',
                    CONCAT(' ', h.family_head_middle_name), ''),
                  IF(h.family_head_suffix IS NOT NULL AND h.family_head_suffix <> '',
                    CONCAT(' ', h.family_head_suffix), '')
              )
          END AS familyHead,

          h.house_structure AS houseStructure,
          h.house_condition AS houseCondition,
          h.latitude,
          h.longitude,
          h.street,
          h.barangay

      FROM households h
      LEFT JOIN family_information f
          ON h.household_id = f.household_id
      LEFT JOIN population p
          ON f.family_id = p.family_id

      GROUP BY
          h.household_id,
          h.multiple_family,
          h.family_head_first_name,
          h.family_head_middle_name,
          h.family_head_last_name,
          h.family_head_suffix,
          h.house_structure,
          h.house_condition,
          h.latitude,
          h.longitude,
          h.street,
          h.barangay

      ORDER BY h.household_id;
    `);
    
    res.status(200).json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error fetching household data:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching household data', 
      error: error.message 
    });
  }
}


