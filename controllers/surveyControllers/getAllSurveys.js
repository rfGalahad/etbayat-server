import pool from '../../config/db.js';

export const getAllSurveys = async (req, res) => {
  try {
    const { role, userId } = req.user;

    let query = `
      SELECT 
        s.survey_id,
        s.respondent,
        s.created_at,
        u.name AS interviewer,
        u.role,
        h.barangay
    FROM surveys s
    LEFT JOIN users u
        ON s.user_id = u.user_id
    LEFT JOIN households h
        ON s.survey_id = h.survey_id`;
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