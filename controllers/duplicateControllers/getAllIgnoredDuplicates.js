import pool from '../../config/db.js';

export const getAllIgnoredDuplicates = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        id.id,
        id.resident_id_1,
        id.resident_id_2,
        id.ignored_at,
        id.ignored_by,
        id.reason,
        p1.first_name AS first_name_1,
        p1.last_name AS last_name_1,
        DATE_FORMAT(p1.birthdate, '%m-%d-%Y') AS birthdate_1,
        p2.first_name AS first_name_2,
        p2.last_name AS last_name_2,
        DATE_FORMAT(p2.birthdate, '%m-%d-%Y') AS birthdate_2
      FROM ignored_duplicates id
      JOIN population p1 ON id.resident_id_1 = p1.resident_id
      JOIN population p2 ON id.resident_id_2 = p2.resident_id
      ORDER BY id.ignored_at DESC
    `);
    
    res.status(200).json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error fetching ignored duplicates:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching ignored duplicates',
      error: error.message
    });
  }
};