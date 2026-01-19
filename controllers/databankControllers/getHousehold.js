import pool from '../../config/db.js';

export const getHousehold = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        p.household_id,
        h.survey_id,
        CONCAT(
            p.last_name, ', ',
            p.first_name,
            IFNULL(CONCAT(' ', p.middle_name), ''),
            IFNULL(CONCAT(' ', p.suffix), '')
        ) AS name,
        hi.house_structure,
        hi.house_condition,
        hi.street,
        hi.barangay
      FROM population p
      JOIN households h
          ON p.household_id = h.household_id
      JOIN house_information hi
          ON p.household_id = hi.household_id
      WHERE p.relation_to_family_head = 'Family Head';
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


