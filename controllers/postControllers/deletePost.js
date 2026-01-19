import pool from '../../config/db.js';
import cloudinary from '../../config/cloudinary.js';


export const deletePost = async (req, res) => {
  try {
    const postID = req.params.postId;

    // GET PUBLIC ID
    const [rows] = await pool.query(
      'SELECT post_title, post_thumbnail_id FROM posts WHERE post_id = ?',
      [postID]
    );

    // DELETE EXISTING IMAGE FROM CLOUDINARY
    await cloudinary.uploader.destroy(rows[0]?.post_thumbnail_id);

    // DELETE FROM POSTS TABLE
    await pool.query(
      `DELETE FROM posts WHERE post_id = ?`,
      [postID]
    );

    return res.status(200).json({ 
      success: true,
      post_title: rows[0]?.post_title
    });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ message: 'Server error' });
  }
};