import pool from '../../config/db.js';

export const getAllPopulation = async (req, res) => {
  try {
    const [current] = await pool.query(`
      SELECT 
          h.barangay,
          COUNT(p.resident_id) AS total_population
      FROM population p
      JOIN family_information f ON p.family_id = f.family_id
      JOIN households h ON f.household_id = h.household_id
      JOIN surveys s ON f.survey_id = s.survey_id
      WHERE p.resident_id LIKE 'RID%'
        AND YEAR(s.updated_at) = YEAR(CURDATE())
      GROUP BY h.barangay
      ORDER BY h.barangay;
    `);

    const [history] = await pool.query(`
      SELECT 
          hh.barangay,
          COUNT(ph.resident_id) AS total_population
      FROM population_history ph
      JOIN family_information_history fh 
          ON ph.family_id = fh.family_id
          AND ph.survey_year = fh.survey_year
      JOIN households_history hh 
          ON fh.household_id = hh.household_id
          AND fh.survey_year = hh.survey_year
      WHERE ph.resident_id LIKE 'RID%'
        AND ph.survey_year = YEAR(CURDATE()) - 1
      GROUP BY hh.barangay
      ORDER BY hh.barangay;
    `);

    res.status(200).json({
      success: true,
      data: current,
      dataHistory: history
    });
  } catch (error) {
    console.error('Error fetching population:', error);
    res.status(500).json({ success: false, message: 'Error fetching population', error: error.message });
  }
}