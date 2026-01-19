import bcrypt from 'bcryptjs';
import pool from '../../config/db.js';



export const createUser = async (req, res) => {

  const connection = await pool.getConnection();
  const newUser = req.body;
  const hash = await bcrypt.hash(newUser.password, 10);

  try {
    // CHECK IF USERNAME ALREADY EXISTS
    const [existing] = await connection.query(
      `SELECT * FROM users WHERE username = ?`,
      [newUser.username]
    );

    if (existing.length > 0) {
      return res.status(409).json({ 
        message: 'Username already exists' 
      });
    }

    // INSERT NEW ACCOUNT
    const [results] = await connection.query(
      `INSERT INTO users VALUES (?, ?, ?, ?, ?, ?)`,
      [
        newUser.user_id,
        newUser.name,
        newUser.username,
        hash,
        newUser.role,
        newUser.barangay
      ]
    );

    res.status(200).json({ 
      success: results.affectedRows > 0, 
      message: 'User added successfully' 
    });
  } catch (err) {
    console.error("Error adding user:", err);
    res.status(500).json({ error: "Error adding user", details: err.message });
  } finally {
    connection.release();
  }
}