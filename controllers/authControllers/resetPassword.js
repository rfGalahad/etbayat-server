import pool from '../../config/db.js';
import bcrypt from 'bcryptjs';


export const resetPassword = async (req, res) => {
  try {
    const { user_id, username } = req.body;

    const newPassword = await bcrypt.hash(`${username}001`, 10);    

    await pool.query(`
      UPDATE users 
      SET password = ? 
      WHERE user_id = ?`, 
      [newPassword, user_id]
    );

    console.log('DONE')
    
    res.status(200).json({
      success: true,
      message: "Password successfully reset",
      user_id
    });
  } catch (error) {
    console.error("Error reseting password:", error);
    res.status(500).json({
      error: "Error reseting password",
      details: error.message
    });
  }
};