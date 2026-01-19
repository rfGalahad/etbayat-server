import pool from '../config/db.js';


export const findUserByUsername = async (username) => {
  const [rows] = await pool.query("SELECT * FROM users WHERE username = ?", [username]);
  return rows[0];
};

export const findUserByID = async (userID) => {
  const [rows] = await pool.query("SELECT * FROM users WHERE user_id = ?", [userID]);
  return rows[0];
};

export const createUser = async (userID, name, username, hashedPassword, role, barangay) => {
  const [result] = await pool.query(
    `INSERT INTO users (
      user_id, 
      name, 
      username, 
      password, 
      role,
      barangay ) 
     VALUES (?, ?, ?, ?, ?, ?)`,
    [userID, name, username, hashedPassword, role, barangay]
  );
  return result;
};

export const updateUser = async (userID, userData) => {
  
  const [result] = await pool.query( `
    UPDATE users 
    SET accountName = ?,
        username = ?  
    WHERE user_id = ?`,
    [userData.accountName, userData.username, userID]);

  return result;
};

export const updateUserPassword = async (userID, hashedPassword) => {
  const [result] = await pool.query(
    "UPDATE users SET password = ? WHERE user_id = ?",
    [hashedPassword, userID]
  );
  return result;
};
