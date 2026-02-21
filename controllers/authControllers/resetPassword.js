import pool from '../../config/db.js';
import bcrypt from 'bcryptjs';

const adjectives = [
  "Itbayat", "Ruther", "Vunung", "Pawpaw", "Kester",
  "Kiko", "Hangtay", "Venes", "Tatus", "Smart"
];

const nouns = [
  "Rapang", "Torongan", "Manawa", "Ivang", "Mayavang",
  "Via", "Ripesed", "Karaboboan", "Morong", "Minchahaw"
];

const generateTempPassword = () => {
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const number = Math.floor(10 + Math.random() * 90);
  return `${adj}${noun}${number}`;
};

export const resetPassword = async (req, res) => {
  try {
    const { user_id } = req.body;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: "user_id is required"
      });
    }

    const tempPassword = generateTempPassword();
    const hashedPassword = await bcrypt.hash(tempPassword, 12);

    await pool.query(
      `
      UPDATE users 
      SET password = ?, 
          password_changed_at = NOW(),
          must_change_password = 1
      WHERE user_id = ?
      `,
      [hashedPassword, user_id]
    );

    res.status(200).json({
      success: true,
      message: "Temporary password generated",
      temporary_password: tempPassword
    });
  } catch (error) {
    console.error("Admin reset error:", error);
    res.status(500).json({
      success: false,
      message: "Error resetting password"
    });
  }
};
