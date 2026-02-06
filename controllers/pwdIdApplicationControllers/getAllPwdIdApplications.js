import pool from '../../config/db.js';

export const getAllPwdIdApplications = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
          p.resident_id AS residentId,
          COALESCE(pwd.pwd_id, '') AS pwdId,
          CONCAT_WS(' ', p.first_name, p.middle_name, p.last_name, p.suffix) AS name,
          COALESCE(ci.barangay, h.barangay) AS barangay,
          pwd.created_at AS createdAt
      FROM population p
      INNER JOIN social_classification sc 
          ON p.resident_id = sc.resident_id
      LEFT JOIN family_information fi 
          ON p.family_id = fi.family_id
      LEFT JOIN households h 
          ON fi.household_id = h.household_id
      LEFT JOIN contact_information ci 
          ON p.resident_id = ci.resident_id
      LEFT JOIN pwd_id_applications pwd 
          ON p.resident_id = pwd.resident_id
      WHERE sc.classification_code = 'PWD'
      ORDER BY COALESCE(ci.barangay, h.barangay), p.last_name, p.first_name;
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