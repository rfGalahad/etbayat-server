import pool from '../../config/db.js';

export const getFemaleAgeSegregation = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        barangay,

        SUM(CASE WHEN age < 1 THEN 1 ELSE 0 END) AS below1,
        SUM(CASE WHEN age BETWEEN 1 AND 2 THEN 1 ELSE 0 END) AS age1_2,
        SUM(CASE WHEN age BETWEEN 3 AND 5 THEN 1 ELSE 0 END) AS age3_5,
        SUM(CASE WHEN age BETWEEN 6 AND 12 THEN 1 ELSE 0 END) AS age6_12,
        SUM(CASE WHEN age BETWEEN 13 AND 18 THEN 1 ELSE 0 END) AS age13_18,
        SUM(CASE WHEN age BETWEEN 19 AND 49 THEN 1 ELSE 0 END) AS age19_49,
        SUM(CASE WHEN age BETWEEN 50 AND 59 THEN 1 ELSE 0 END) AS age50_59,
        SUM(CASE WHEN age BETWEEN 60 AND 69 THEN 1 ELSE 0 END) AS age60_69,
        SUM(CASE WHEN age >= 70 THEN 1 ELSE 0 END) AS age70_above

      FROM (
        SELECT
            p.resident_id,
            h.barangay,
            TIMESTAMPDIFF(YEAR, p.birthdate, CURDATE()) AS age
        FROM population p
        JOIN family_information f ON p.family_id = f.family_id
        JOIN households h ON f.household_id = h.household_id
        WHERE p.sex = 'Female'
      ) AS derived
      GROUP BY barangay
      ORDER BY barangay;
    `);
    
    res.status(200).json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching stats', 
      error: error.message 
    });
  }
};

export const getMaleAgeSegregation = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        barangay,

        SUM(CASE WHEN age < 1 THEN 1 ELSE 0 END) AS below1,
        SUM(CASE WHEN age BETWEEN 1 AND 2 THEN 1 ELSE 0 END) AS age1_2,
        SUM(CASE WHEN age BETWEEN 3 AND 5 THEN 1 ELSE 0 END) AS age3_5,
        SUM(CASE WHEN age BETWEEN 6 AND 12 THEN 1 ELSE 0 END) AS age6_12,
        SUM(CASE WHEN age BETWEEN 13 AND 18 THEN 1 ELSE 0 END) AS age13_18,
        SUM(CASE WHEN age BETWEEN 19 AND 49 THEN 1 ELSE 0 END) AS age19_49,
        SUM(CASE WHEN age BETWEEN 50 AND 59 THEN 1 ELSE 0 END) AS age50_59,
        SUM(CASE WHEN age BETWEEN 60 AND 69 THEN 1 ELSE 0 END) AS age60_69,
        SUM(CASE WHEN age >= 70 THEN 1 ELSE 0 END) AS age70_above

      FROM (
        SELECT
            p.resident_id,
            h.barangay,
            TIMESTAMPDIFF(YEAR, p.birthdate, CURDATE()) AS age
        FROM population p
        JOIN family_information f ON p.family_id = f.family_id
        JOIN households h ON f.household_id = h.household_id
        WHERE p.sex = 'Male'
      ) AS derived
      GROUP BY barangay
      ORDER BY barangay;
    `);
    
    res.status(200).json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching stats', 
      error: error.message 
    });
  }
};