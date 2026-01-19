import db from '../../config/db.js';
import bcrypt from 'bcryptjs';

export const createUsersBatch = async (req, res) => {

  const connection = await db.getConnection();
  const users = req.body;
  

  try {
    const usersValues = await Promise.all(
      users.map(async (user) => {
        const hash = await bcrypt.hash(user.password, 10);
        return [
          user.user_id,
          user.name,
          user.username,
          hash,
          user.role,
          user.barangay
        ];
      })
    ); 

    const [result] = await connection.query(
      `INSERT INTO users (
        user_id, 
        name, 
        username, 
        password, 
        role, 
        barangay
      ) VALUES ?`,
      [ usersValues ]
    );

    return res.status(201).json({ 
      message: `Users Added!`,
      users: result.success
    });
  } catch (err) {
    console.error("Error adding users:", err);
    res.status(500).json({ error: "Error adding users", details: err.message });
  } finally {
    connection.release();
  }
}