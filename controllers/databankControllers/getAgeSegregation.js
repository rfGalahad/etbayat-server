import pool from '../../config/db.js';

export const getFemaleSegregation = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        CASE
          WHEN TIMESTAMPDIFF(YEAR, p.birthdate, CURDATE()) = 0
            THEN '0-11 months'
          WHEN TIMESTAMPDIFF(YEAR, p.birthdate, CURDATE()) >= 101
            THEN '101+'
          ELSE CAST(TIMESTAMPDIFF(YEAR, p.birthdate, CURDATE()) AS CHAR)
        END AS age_bracket,
        h.barangay,
        COUNT(*) AS total
      FROM population p
      JOIN family_information f ON p.family_id = f.family_id
      JOIN households h ON f.household_id = h.household_id
      WHERE p.sex = 'Female'
      GROUP BY age_bracket, h.barangay
      ORDER BY
        CASE
          WHEN age_bracket = '0-11 months' THEN 0
          WHEN age_bracket = '101+' THEN 102
          ELSE CAST(age_bracket AS UNSIGNED)
        END;
    `);
    
    res.status(200).json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching data', 
      error: error.message 
    });
  }
}

export const getMaleSegregation = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        p.sex,
        CASE 
          WHEN TIMESTAMPDIFF(YEAR, p.birthdate, CURDATE()) < 1 THEN 'Below 1'
          WHEN TIMESTAMPDIFF(YEAR, p.birthdate, CURDATE()) BETWEEN 1 AND 2 THEN '1-2'
          WHEN TIMESTAMPDIFF(YEAR, p.birthdate, CURDATE()) BETWEEN 3 AND 5 THEN '3-5'
          WHEN TIMESTAMPDIFF(YEAR, p.birthdate, CURDATE()) BETWEEN 6 AND 12 THEN '6-12'
          WHEN TIMESTAMPDIFF(YEAR, p.birthdate, CURDATE()) BETWEEN 13 AND 18 THEN '13-18'
          WHEN TIMESTAMPDIFF(YEAR, p.birthdate, CURDATE()) BETWEEN 19 AND 39 THEN '19-39'
          WHEN TIMESTAMPDIFF(YEAR, p.birthdate, CURDATE()) BETWEEN 40 AND 59 THEN '40-59'
          WHEN TIMESTAMPDIFF(YEAR, p.birthdate, CURDATE()) BETWEEN 60 AND 70 THEN '60-70'
          WHEN TIMESTAMPDIFF(YEAR, p.birthdate, CURDATE()) > 70 THEN '71 above'
        END AS age_bracket,
        COUNT(*) as count
      FROM population p
      INNER JOIN family_information f ON p.family_id = f.family_id
      INNER JOIN households h ON f.household_id = h.household_id
      WHERE p.birthdate IS NOT NULL
      GROUP BY p.sex, age_bracket
      ORDER BY 
        p.sex,
        FIELD(age_bracket, 'Below 1', '1-2', '3-5', '6-12', '13-18', '19-39', '40-59', '60-70', '71 above')
    `);
    
    res.status(200).json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching data', 
      error: error.message 
    });
  }
}


