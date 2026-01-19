import pool from '../../config/db.js';

export const getAllActivityLogs = async (req, res) => {
  try {

    const [rows] = await pool.query(`
      SELECT *
      FROM users u
      INNER JOIN activity_log a
      ON u.user_id = a.user_id 
      ORDER BY created_at DESC`
    );

    res.status(200).json({
      success: true,
      data: rows
    });

  } catch (error) {
    console.error('Error getting activity logs:', error);
    res.status(500).json({ message: 'Server error' });
  }
};