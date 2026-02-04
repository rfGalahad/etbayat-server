import pool from '../../config/db.js';

export const getAllSurveys = async (req, res) => {
  try {
    const { role, userId } = req.user;

    let query = `
      SELECT  
          s.survey_id,
          CONCAT(
              s.respondent_last_name, ', ',
              s.respondent_first_name,
              IF(s.respondent_middle_name IS NOT NULL AND s.respondent_middle_name <> '', CONCAT(' ', s.respondent_middle_name), ''),
              IF(s.respondent_suffix IS NOT NULL AND s.respondent_suffix <> '', CONCAT(' ', s.respondent_suffix), '')
          ) AS respondent,
          s.created_at,
          s.updated_at,
          u.name AS interviewer,
          u.role,
          h.barangay
      FROM surveys s
      LEFT JOIN users u
          ON s.user_id = u.user_id
      LEFT JOIN family_information f
          ON f.survey_id = s.survey_id
      LEFT JOIN households h
          ON h.household_id = f.household_id
      ORDER BY updated_at DESC
      `;
    let params = [];

    if (role === 'Barangay Official') {
      query += ' WHERE s.user_id = ?';
      params.push(userId);
    }

    const [rows] = await pool.query(query, params);

    res.status(200).json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error fetching survey data:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching survey data', 
      error: error.message 
    });
  }
}