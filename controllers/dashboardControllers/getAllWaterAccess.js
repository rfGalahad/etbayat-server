import pool from '../../config/db.js';

export const getAllWaterAccess = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
          h.barangay,
          COUNT(DISTINCT h.household_id) AS total_households,
          SUM(CASE WHEN w.water_access = TRUE THEN 1 ELSE 0 END) AS households_with_water_access,
          SUM(CASE WHEN w.potable_water = TRUE THEN 1 ELSE 0 END) AS households_with_potable_water
      FROM households h
      LEFT JOIN water_information w
          ON h.household_id = w.household_id
      GROUP BY h.barangay;
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