import pool from '../../config/db.js';

export const getAllWaterSources = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
          h.barangay,
          TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(w.water_sources, ',', n.n), ',', -1)) AS water_source,
          COUNT(*) AS total
      FROM water_information w
      JOIN households h ON h.household_id = w.household_id
      JOIN (
          SELECT 1 n UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5
      ) n
      ON CHAR_LENGTH(w.water_sources) - CHAR_LENGTH(REPLACE(w.water_sources, ',', '')) >= n.n - 1
      GROUP BY h.barangay, water_source
      ORDER BY h.barangay, water_source;
    `);
    
    const transformed = {};

    rows.forEach(r => {
      if (!transformed[r.barangay]) {
        transformed[r.barangay] = { barangay: r.barangay };
      }
      transformed[r.barangay][r.water_source] = r.total;
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