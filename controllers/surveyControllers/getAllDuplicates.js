import pool from '../../config/db.js';

export const getAllDuplicates = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT p.*
      FROM population p
      JOIN (
          SELECT
              TRIM(LOWER(first_name)) AS first_name,
              TRIM(LOWER(last_name)) AS last_name,
              birthdate
          FROM population
          GROUP BY
              TRIM(LOWER(first_name)),
              TRIM(LOWER(last_name)),
              birthdate
          HAVING COUNT(*) > 1
      ) d
      ON TRIM(LOWER(p.first_name)) = d.first_name
      AND TRIM(LOWER(p.last_name)) = d.last_name
      AND p.birthdate = d.birthdate
      ORDER BY p.last_name, p.first_name;
    `);

    res.status(200).json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error fetching duplicates data:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching duplicates data', 
      error: error.message 
    });
  }
}