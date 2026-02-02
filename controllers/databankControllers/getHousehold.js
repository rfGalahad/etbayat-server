import pool from '../../config/db.js';

export const getHousehold = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
          h.household_id,
          GROUP_CONCAT(
              CONCAT(
                  p.last_name, ', ',
                  p.first_name,
                  IF(p.middle_name IS NOT NULL AND p.middle_name <> '', CONCAT(' ', p.middle_name), ''),
                  IF(p.suffix IS NOT NULL AND p.suffix <> '', CONCAT(' ', p.suffix), '')
              )
              ORDER BY p.last_name, p.first_name
              SEPARATOR ' | '
          ) AS family_head_names,
          h.house_structure,
          h.house_condition,
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


