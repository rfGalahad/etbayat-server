import * as userModel from '../../models/userModel.js';



export const updateUserProfile = async (req, res) => {
  try {
    const { userId, username, name } = req.user;

    // CHECK USERNAME IF ALREADY TAKEN
    if (username && name) {
      const existingUser = await pool.query(`
        SELECT username FROM users WHERE username = ?`, [username])
      if (existingUser && existingUser.userId !== userId) {
        return res.status(400).json({
          error: "Username is already taken"
        });
      }
    }

    await pool.query( `
      UPDATE users 
      SET name = ?,
          username = ?  
      WHERE user_id = ?`,
      [
        name, 
        username, 
        userId
      ]
    );
    
    res.status(200).json({
      success: true,
      message: "Profile updated successfully"
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    res.status(500).json({
      error: "Error updating user profile",
      details: error.message
    });
  }
};