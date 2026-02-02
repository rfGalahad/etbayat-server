import pool from '../../config/db.js';

export const getAllFamily = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
          h.barangay,
          COUNT(f.family_id) AS total_family
      FROM family_information f
      JOIN households h 
          ON f.household_id = h.household_id
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