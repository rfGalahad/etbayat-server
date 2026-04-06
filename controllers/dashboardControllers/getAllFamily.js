import pool from '../../config/db.js';

export const getAllFamily = async (req, res) => {
  try {
    const [current] = await pool.query(`
      SELECT 
          h.barangay,
          COUNT(f.family_id) AS total_family
      FROM family_information f
      JOIN households h 
        ON f.household_id = h.household_id
      JOIN surveys s 
        ON f.survey_id = s.survey_id
      WHERE YEAR(s.updated_at) = YEAR(CURDATE())
      GROUP BY h.barangay
      ORDER BY h.barangay;
    `);
    
    const [history] = await pool.query(`
      SELECT 
          hh.barangay,
          COUNT(fh.family_id) AS total_family
      FROM family_information_history fh
      LEFT JOIN households_history hh 
        ON fh.household_id = hh.household_id
      LEFT JOIN surveys_history sh 
        ON fh.survey_id = sh.survey_id
      WHERE sh.survey_year = YEAR(CURDATE()) - 1
      GROUP BY hh.barangay
      ORDER BY hh.barangay;
    `);

    res.status(200).json({
      success: true,
      data: current, 
      dataHistory: history 
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching stats', 
      error: error.message 
    });
  }
}