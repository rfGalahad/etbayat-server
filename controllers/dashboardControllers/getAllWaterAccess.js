import pool from '../../config/db.js';

export const getAllWaterAccess = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
          h.barangay,
          COUNT(DISTINCT h.household_id) AS total_households,
          COUNT(DISTINCT CASE 
              WHEN w.water_access = TRUE THEN h.household_id 
          END) AS households_with_water_access,
          COUNT(DISTINCT CASE 
              WHEN w.potable_water = TRUE THEN h.household_id 
          END) AS households_with_potable_water
      FROM households h
      LEFT JOIN family_information f
          ON f.household_id = h.household_id
      LEFT JOIN water_information w
          ON w.survey_id = f.survey_id
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