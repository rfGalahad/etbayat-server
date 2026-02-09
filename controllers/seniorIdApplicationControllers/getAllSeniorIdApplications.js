import pool from '../../config/db.js';

export const getAllSeniorIdApplications = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
          p.resident_id AS residentId,
          COALESCE(sc.senior_citizen_id, '') AS seniorCitizenId,
          CONCAT_WS(' ', p.first_name, p.middle_name, p.last_name, p.suffix) AS name,
          COALESCE(ci.barangay, h.barangay) AS barangay,
          sc.created_at AS createdAt
      FROM population p
      LEFT JOIN family_information fi 
          ON p.family_id = fi.family_id
      LEFT JOIN households h 
          ON fi.household_id = h.household_id
      LEFT JOIN contact_information ci 
          ON p.resident_id = ci.resident_id
      LEFT JOIN senior_citizen_id_applications sc 
          ON p.resident_id = sc.resident_id
      WHERE TIMESTAMPDIFF(YEAR, p.birthdate, CURDATE()) >= 60
      ORDER BY COALESCE(ci.barangay, h.barangay), p.last_name, p.first_name;
    `);

    res.status(200).json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error fetching senior citizen id applications data:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching senior citizen id applications data', 
      error: error.message 
    });
  }
}