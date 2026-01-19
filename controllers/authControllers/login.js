import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import * as userModel from '../../models/userModel.js';


export const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // FIND USER
    const user = await userModel.findUserByUsername(username);
    if (!user) return res.status(404).json({ error: "User not found" });
    
    // VERIFY PASSWORD
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

    // GENERATE TOKEN
    const token = jwt.sign(
      { 
        userId: user.user_id,
        role: user.role,
        username: user.username,
        name: user.name
      }, 
      process.env.JWT_SECRET, 
      { expiresIn: "1d" }
    );
    
    res.json ({ 
      message: "Login successful", 
      token,
      userID: user.user_id,
      username: user.username,
      name: user.name,
      role: user.role,
      barangay: user.barangay
    });

  } catch (err) {
    console.error("Error during login:", err);
    res.status(500).json({ error: "Error during login", details: err.message });
  }
}; 