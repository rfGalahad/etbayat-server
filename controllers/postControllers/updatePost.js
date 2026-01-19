import pool from '../../config/db.js';
import cloudinary from '../../config/cloudinary.js';


export const updatePost = async (req, res) => {
  try {    
    const postID = req.params.postId;
    const { userID, postTitle, postDescription, publicId } = req.body;

    if (req.file) {
      // DELETE EXISTING IMAGE FROM CLOUDINARY
      await cloudinary.uploader.destroy(publicId);

      // INSERT NEW IMAGE
      const base64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
      const result = await cloudinary.uploader.upload(base64, {
        folder: 'posts',
      });

      // UPDATE POSTS TABLE
      await pool.query(
        `UPDATE posts 
        SET user_id = ?,
            post_title = ?, 
            post_description = ?, 
            post_thumbnail_url = ?,
            post_thumbnail_id = ?
        WHERE post_id = ?`,
        [ 
          userID,
          postTitle, 
          postDescription, 
          result.secure_url,
          result.public_id,
          postID, 
        ]
      );
    } else {
      // UPDATE ONLY USER ID, TITLE, & DESCRIPTION
      await pool.query(
        `UPDATE posts 
        SET user_id = ?,
            post_title = ?, 
            post_description = ?
        WHERE post_id = ?`,
        [ 
          userID,
          postTitle, 
          postDescription, 
          postID, 
        ]
      );
    }
    
    res.status(200).json({ 
      success: true, 
      message: 'Post updated successfully',
      post_title: postTitle
    });
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({ message: 'Server error' });
  }
};