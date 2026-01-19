import pool from '../../config/db.js';
import cloudinary from '../../config/cloudinary.js';


export const createPost = async (req, res) => {
  try {
    const { userID, postTitle, postDescription } = req.body;

    // INSERT IMAGE TO CLOUDINARY
    const base64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    const result = await cloudinary.uploader.upload(base64, {
      folder: 'posts',
    });

    await pool.query(
      `INSERT INTO posts 
       (user_id, post_title, post_description, post_thumbnail_url, post_thumbnail_id) 
       VALUES (?, ?, ?, ?, ?)`,
      [ userID, postTitle, postDescription, result.secure_url, result.public_id ]  
    );

    res.status(201).json({ 
      message: 'Post created successfully',
      post_title: postTitle
    });
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ message: 'Server error' });
  }
};