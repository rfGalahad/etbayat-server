import pool from '../../config/db.js';

export const getAllPwdIdApplications = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        CONCAT(
          p.first_name, ' ',
          IFNULL(p.middle_name, ''), ' ',
          p.last_name,
          IFNULL(CONCAT(' ', p.suffix), '')
        ) AS name,
        a.pwd_id,
        a.created_at,
        a.resident_id,
        c.barangay
      FROM pwd_id_applications a
      JOIN population p ON a.resident_id = p.resident_id
      JOIN contact_information c ON c.resident_id = p.resident_id;
    `);

    res.status(200).json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error fetching pwd id applications data:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching pwd id applications data', 
      error: error.message 
    });
  }
}