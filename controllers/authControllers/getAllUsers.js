import db from '../../config/db.js';


export const getAllUsers = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT * FROM users
      WHERE role != 'Admin'
      ORDER BY user_id ASC;
    `);
    
    res.status(200).json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error fetching users data:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching users data', 
      error: error.message 
    });
  }
}