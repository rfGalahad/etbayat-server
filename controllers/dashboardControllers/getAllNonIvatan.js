import pool from '../../config/db.js';

export const getAllNonIvatan = async (req, res) => {
  try {
    const [current] = await pool.query(`
      SELECT 
        h.barangay,
        COUNT(p.resident_id) AS total_nonIvatan
      FROM population p
      JOIN family_information f 
        ON p.family_id = f.family_id
      JOIN households h 
        ON f.household_id = h.household_id
      JOIN social_classification sc 
        ON sc.resident_id = p.resident_id
      JOIN surveys s
        ON s.survey_id = f.survey_id
      WHERE sc.classification_code = 'IPULA'
        AND YEAR(s.updated_at) = YEAR(CURDATE())
      GROUP BY h.barangay
      ORDER BY h.barangay;
    `);

    const [history] = await pool.query(`
      SELECT 
        hh.barangay,
        COUNT(ph.resident_id) AS total_nonIvatan
      FROM population_history ph
      JOIN family_information_history fh 
        ON ph.family_id = fh.family_id
      JOIN households_history hh 
        ON fh.household_id = hh.household_id
      JOIN social_classification_history sc 
        ON sc.resident_id = ph.resident_id
      JOIN surveys_history sh
        ON sh.survey_id = fh.survey_id
      WHERE sc.classification_code = 'IPULA'
        AND sh.survey_year = YEAR(CURDATE()) - 1 
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