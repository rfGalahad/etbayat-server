import pool from '../../config/db.js';

export const getAllSeniorCitizen = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
          h.barangay,
          COUNT(p.resident_id) AS total_seniorCitizen
      FROM population p
      JOIN family_information f 
          ON p.family_id = f.family_id
      JOIN households h 
          ON f.household_id = h.household_id
      JOIN social_classification sc
          ON sc.resident_id = p.resident_id
      WHERE TIMESTAMPDIFF(YEAR, p.birthdate, CURDATE()) >= 60
      GROUP BY h.barangay
      ORDER BY h.barangay;
    `);
    
    res.status(200).json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching stats', 
      error: error.message 
    });
  }
}