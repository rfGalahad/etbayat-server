import pool from '../../config/db.js';

export const getPostById = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM posts WHERE post_id = ?',
      [req.params.postId]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    res.json({
      success: true,
      data: rows[0]
    });
  } catch (error) {
    console.error('Error getting post:', error);
    res.status(500).json({ message: 'Server error' });
  }
};