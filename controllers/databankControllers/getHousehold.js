import pool from '../../config/db.js';

export const getHousehold = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
          h.household_id as householdId,
          CONCAT(
              h.family_head_last_name, ', ',
              h.family_head_first_name,
              IF(h.family_head_middle_name IS NOT NULL AND h.family_head_middle_name <> '', CONCAT(' ', h.family_head_middle_name), ''),
              IF(h.family_head_suffix IS NOT NULL AND h.family_head_suffix <> '', CONCAT(' ', h.family_head_suffix), '')
          ) AS familyHead,
          h.house_structure as houseStructure,
          h.house_condition as houseCondition,
          h.street,
          h.barangay
      FROM population p
      JOIN family_information f
          ON p.family_id = f.family_id
      JOIN households h
          ON f.household_id = h.household_id
      WHERE p.relation_to_family_head = 'Family Head'
      GROUP BY
          h.household_id,
          h.house_structure,
          h.house_condition,
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


