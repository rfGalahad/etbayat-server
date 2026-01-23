import pool from '../../config/db.js';



export const updateUserProfile = async (req, res) => {
  try {
    const { userId } = req.user;
    const { username, name } = req.body;

    console.log("Updating profile for user ID:", userId);
    console.log("New username:", username);
    console.log("New name:", name);

    // CHECK IF USERNAME IS ALREADY TAKEN (only if username is being updated)
    if (username !== undefined) {
      const existingUser = await pool.query(`
        SELECT user_id FROM users WHERE username = ?`, [username]);
      
      if (existingUser.length > 0 && existingUser[0].user_id !== userId) {
        return res.status(400).json({
          error: "Username is already taken"
        });
      }
    }

    // Build dynamic update query
    const updates = [];
    const values = [];

    if (name !== undefined) {
      updates.push('name = ?');
      values.push(name);
    }

    if (username !== undefined) {
      updates.push('username = ?');
      values.push(username);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        error: "No fields to update"
      });
    }

    values.push(userId);

    await pool.query(
      `UPDATE users SET ${updates.join(', ')} WHERE user_id = ?`,
      values
    );

    console.log('DONE')
    
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