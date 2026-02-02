import pool from '../../config/db.js';

export const getFamily = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        p.family_id,
        CONCAT(
          p.last_name, ', ',
          p.first_name,
          IFNULL(CONCAT(' ', p.middle_name), ''),
          IFNULL(CONCAT(' ', p.suffix), '')
        ) AS familyHead,
        s.service_availed,
          h.barangay
      FROM population p
      JOIN family_information fi ON fi.family_id = p.family_id
      LEFT JOIN service_availed s ON s.family_id = p.family_id
      JOIN households h ON fi.household_id = h.household_id
      WHERE p.relation_to_family_head = 'Family Head';
    `);
    
    res.status(200).json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error fetching family data:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching family data', 
      error: error.message 
    });
  }
}


