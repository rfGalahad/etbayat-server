import pool from '../../config/db.js';

export const getAllHousehold = async (req, res) => {
  try {
    const [current] = await pool.query(`
      SELECT 
          h.barangay,
          COUNT(h.household_id) AS total_household
      FROM households h
      JOIN family_information f
        ON f.household_id = h.household_id
      JOIN surveys s
        ON s.survey_id = f.survey_id
      WHERE YEAR(s.updated_at) = YEAR(CURDATE()) 
      GROUP BY h.barangay
      ORDER BY h.barangay;
    `);

    const [history] = await pool.query(`
      SELECT 
          hh.barangay,
          COUNT(hh.household_id) AS total_household
      FROM households_history hh
      JOIN family_information_history fh
        ON fh.household_id = hh.household_id
      JOIN surveys_history sh
        ON sh.survey_id = fh.survey_id
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