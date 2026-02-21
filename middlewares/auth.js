import jwt from "jsonwebtoken";
import pool from "../config/db.js";

export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "Access denied" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 🔎 Check latest password change time from DB
    const [rows] = await pool.query(
      `SELECT password_changed_at, must_change_password 
       FROM users 
       WHERE user_id = ?`,
      [decoded.userId]
    );

    if (!rows.length) {
      return res.status(401).json({ error: "User not found" });
    }

    const user = rows[0];

    // 🚨 Invalidate token if password was changed AFTER token was issued
    if (
      user.password_changed_at &&
      new Date(decoded.iat * 1000) < new Date(user.password_changed_at)
    ) {
      return res.status(401).json({
        error: "Session expired. Please login again."
      });
    }

    req.user = {
      userId: decoded.userId,
      role: decoded.role,
      name: decoded.name,
      username: decoded.username,
      barangay: decoded.barangay,
      must_change_password: user.must_change_password
    };

    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
};
