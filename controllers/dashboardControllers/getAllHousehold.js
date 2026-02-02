import pool from '../../config/db.js';

export const getAllHousehold = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
          barangay,
          COUNT(household_id) AS total_household
      FROM households
      GROUP BY barangay
      ORDER BY barangay;
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