import pool from '../../config/db.js';

export const getAllHouseholdCondition = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
          barangay,
          house_condition,
          COUNT(*) AS total
      FROM households
      GROUP BY barangay, house_condition
      ORDER BY barangay, house_condition;
    `);
    
    const transformed = {};
    rows.forEach(item => {
      if (!transformed[item.barangay]) transformed[item.barangay] = { barangay: item.barangay };
      transformed[item.barangay][item.house_condition] = item.total;
    });
    
    res.status(200).json({
      success: true,
      data: Object.values(transformed)
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