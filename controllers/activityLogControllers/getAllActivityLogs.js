import pool from '../../config/db.js';

export const getAllActivityLogs = async (req, res) => {
  try {
    const { role, userId, barangay } = req.user;

    let query = `
      SELECT *
      FROM users u
      INNER JOIN activity_log a
      ON u.user_id = a.user_id
    `;
    let params = [];

    if (role === 'Barangay Secretary') {
      query += ' WHERE u.barangay = ?';
      params.push(barangay)
    }

    query += ' ORDER BY created_at DESC';

    const [rows] = await pool.query(query, params);

    res.status(200).json({
      success: true,
      data: rows
    });

  } catch (error) {
    console.error('Error getting activity logs:', error);
    res.status(500).json({ message: 'Server error' });
  }
};