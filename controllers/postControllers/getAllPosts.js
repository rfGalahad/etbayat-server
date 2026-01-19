import pool from '../../config/db.js';

export const getAllPosts = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT * 
      FROM users u
      INNER JOIN posts p
      ON u.user_id = p.user_id
      ORDER BY p.created_at DESC 
    `);
    
    res.status(200).json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error fetching news updates:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching news updates', 
      error: error.message 
    });
  }
}


