import pool from '../../config/db.js';

export const getFemaleSegregation = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      WITH age_brackets AS (
          SELECT '0-11 months' AS age_bracket, 0 AS sort_order
          UNION ALL
          SELECT CAST(n AS CHAR), n FROM (
              SELECT 1 AS n UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL 
              SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9 UNION ALL 
              SELECT 10 UNION ALL SELECT 11 UNION ALL SELECT 12 UNION ALL SELECT 13 UNION ALL SELECT 14 UNION ALL 
              SELECT 15 UNION ALL SELECT 16 UNION ALL SELECT 17 UNION ALL SELECT 18 UNION ALL SELECT 19 UNION ALL 
              SELECT 20 UNION ALL SELECT 21 UNION ALL SELECT 22 UNION ALL SELECT 23 UNION ALL SELECT 24 UNION ALL 
              SELECT 25 UNION ALL SELECT 26 UNION ALL SELECT 27 UNION ALL SELECT 28 UNION ALL SELECT 29 UNION ALL 
              SELECT 30 UNION ALL SELECT 31 UNION ALL SELECT 32 UNION ALL SELECT 33 UNION ALL SELECT 34 UNION ALL 
              SELECT 35 UNION ALL SELECT 36 UNION ALL SELECT 37 UNION ALL SELECT 38 UNION ALL SELECT 39 UNION ALL 
              SELECT 40 UNION ALL SELECT 41 UNION ALL SELECT 42 UNION ALL SELECT 43 UNION ALL SELECT 44 UNION ALL 
              SELECT 45 UNION ALL SELECT 46 UNION ALL SELECT 47 UNION ALL SELECT 48 UNION ALL SELECT 49 UNION ALL 
              SELECT 50 UNION ALL SELECT 51 UNION ALL SELECT 52 UNION ALL SELECT 53 UNION ALL SELECT 54 UNION ALL 
              SELECT 55 UNION ALL SELECT 56 UNION ALL SELECT 57 UNION ALL SELECT 58 UNION ALL SELECT 59 UNION ALL 
              SELECT 60 UNION ALL SELECT 61 UNION ALL SELECT 62 UNION ALL SELECT 63 UNION ALL SELECT 64 UNION ALL 
              SELECT 65 UNION ALL SELECT 66 UNION ALL SELECT 67 UNION ALL SELECT 68 UNION ALL SELECT 69 UNION ALL 
              SELECT 70 UNION ALL SELECT 71 UNION ALL SELECT 72 UNION ALL SELECT 73 UNION ALL SELECT 74 UNION ALL 
              SELECT 75 UNION ALL SELECT 76 UNION ALL SELECT 77 UNION ALL SELECT 78 UNION ALL SELECT 79 UNION ALL 
              SELECT 80 UNION ALL SELECT 81 UNION ALL SELECT 82 UNION ALL SELECT 83 UNION ALL SELECT 84 UNION ALL 
              SELECT 85 UNION ALL SELECT 86 UNION ALL SELECT 87 UNION ALL SELECT 88 UNION ALL SELECT 89 UNION ALL 
              SELECT 90 UNION ALL SELECT 91 UNION ALL SELECT 92 UNION ALL SELECT 93 UNION ALL SELECT 94 UNION ALL 
              SELECT 95 UNION ALL SELECT 96 UNION ALL SELECT 97 UNION ALL SELECT 98 UNION ALL SELECT 99 UNION ALL 
              SELECT 100
          ) numbers
          UNION ALL
          SELECT '101 and above', 101
      )
      SELECT 
          ab.age_bracket AS 'Age Bracket',
          COALESCE(SUM(CASE WHEN real_data.barangay = 'Sta. Rosa' THEN 1 ELSE 0 END), 0) AS 'Sta. Rosa',
          COALESCE(SUM(CASE WHEN real_data.barangay = 'Sta. Maria' THEN 1 ELSE 0 END), 0) AS 'Sta. Maria',
          COALESCE(SUM(CASE WHEN real_data.barangay = 'Sta. Lucia' THEN 1 ELSE 0 END), 0) AS 'Sta. Lucia',
          COALESCE(SUM(CASE WHEN real_data.barangay = 'San Rafael' THEN 1 ELSE 0 END), 0) AS 'San Rafael',
          COALESCE(SUM(CASE WHEN real_data.barangay = 'Yawran' THEN 1 ELSE 0 END), 0) AS 'Yawran',
          COALESCE(SUM(CASE WHEN real_data.barangay = 'Raele' THEN 1 ELSE 0 END), 0) AS 'Raele',
          COALESCE(COUNT(real_data.barangay), 0) AS 'Total'
      FROM age_brackets ab
      LEFT JOIN (
          SELECT
              CASE
                  WHEN TIMESTAMPDIFF(MONTH, p.birthdate, CURDATE()) < 12 THEN '0-11 months'
                  WHEN TIMESTAMPDIFF(YEAR, p.birthdate, CURDATE()) >= 101 THEN '101 and above'
                  ELSE CAST(TIMESTAMPDIFF(YEAR, p.birthdate, CURDATE()) AS CHAR)
              END AS age_bracket,
              h.barangay
          FROM population p
          INNER JOIN family_information fi ON p.family_id = fi.family_id
          INNER JOIN households h ON fi.household_id = h.household_id
          WHERE p.birthdate IS NOT NULL
          AND p.sex = 'Female'
      ) real_data ON real_data.age_bracket = ab.age_bracket
      GROUP BY ab.age_bracket, ab.sort_order

      UNION ALL

      SELECT 
          'TOTAL' AS 'Age Bracket',
          COALESCE(SUM(CASE WHEN real_data.barangay = 'Sta. Rosa' THEN 1 ELSE 0 END), 0) AS 'Sta. Rosa',
          COALESCE(SUM(CASE WHEN real_data.barangay = 'Sta. Maria' THEN 1 ELSE 0 END), 0) AS 'Sta. Maria',
          COALESCE(SUM(CASE WHEN real_data.barangay = 'Sta. Lucia' THEN 1 ELSE 0 END), 0) AS 'Sta. Lucia',
          COALESCE(SUM(CASE WHEN real_data.barangay = 'San Rafael' THEN 1 ELSE 0 END), 0) AS 'San Rafael',
          COALESCE(SUM(CASE WHEN real_data.barangay = 'Yawran' THEN 1 ELSE 0 END), 0) AS 'Yawran',
          COALESCE(SUM(CASE WHEN real_data.barangay = 'Raele' THEN 1 ELSE 0 END), 0) AS 'Raele',
          COALESCE(COUNT(real_data.barangay), 0) AS 'Total'
      FROM (
          SELECT h.barangay
          FROM population p
          INNER JOIN family_information fi ON p.family_id = fi.family_id
          INNER JOIN households h ON fi.household_id = h.household_id
          WHERE p.birthdate IS NOT NULL
          AND p.sex = 'Female'
      ) real_data

      ORDER BY 
          CASE 
              WHEN 'Age Bracket' = 'TOTAL' THEN 999
              WHEN 'Age Bracket' = '0-11 months' THEN 0
              WHEN 'Age Bracket' = '101 and above' THEN 101
              ELSE CAST('Age Bracket' AS UNSIGNED)
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
      WITH age_brackets AS (
          SELECT '0-11 months' AS age_bracket, 0 AS sort_order
          UNION ALL
          SELECT CAST(n AS CHAR), n FROM (
              SELECT 1 AS n UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL 
              SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9 UNION ALL 
              SELECT 10 UNION ALL SELECT 11 UNION ALL SELECT 12 UNION ALL SELECT 13 UNION ALL SELECT 14 UNION ALL 
              SELECT 15 UNION ALL SELECT 16 UNION ALL SELECT 17 UNION ALL SELECT 18 UNION ALL SELECT 19 UNION ALL 
              SELECT 20 UNION ALL SELECT 21 UNION ALL SELECT 22 UNION ALL SELECT 23 UNION ALL SELECT 24 UNION ALL 
              SELECT 25 UNION ALL SELECT 26 UNION ALL SELECT 27 UNION ALL SELECT 28 UNION ALL SELECT 29 UNION ALL 
              SELECT 30 UNION ALL SELECT 31 UNION ALL SELECT 32 UNION ALL SELECT 33 UNION ALL SELECT 34 UNION ALL 
              SELECT 35 UNION ALL SELECT 36 UNION ALL SELECT 37 UNION ALL SELECT 38 UNION ALL SELECT 39 UNION ALL 
              SELECT 40 UNION ALL SELECT 41 UNION ALL SELECT 42 UNION ALL SELECT 43 UNION ALL SELECT 44 UNION ALL 
              SELECT 45 UNION ALL SELECT 46 UNION ALL SELECT 47 UNION ALL SELECT 48 UNION ALL SELECT 49 UNION ALL 
              SELECT 50 UNION ALL SELECT 51 UNION ALL SELECT 52 UNION ALL SELECT 53 UNION ALL SELECT 54 UNION ALL 
              SELECT 55 UNION ALL SELECT 56 UNION ALL SELECT 57 UNION ALL SELECT 58 UNION ALL SELECT 59 UNION ALL 
              SELECT 60 UNION ALL SELECT 61 UNION ALL SELECT 62 UNION ALL SELECT 63 UNION ALL SELECT 64 UNION ALL 
              SELECT 65 UNION ALL SELECT 66 UNION ALL SELECT 67 UNION ALL SELECT 68 UNION ALL SELECT 69 UNION ALL 
              SELECT 70 UNION ALL SELECT 71 UNION ALL SELECT 72 UNION ALL SELECT 73 UNION ALL SELECT 74 UNION ALL 
              SELECT 75 UNION ALL SELECT 76 UNION ALL SELECT 77 UNION ALL SELECT 78 UNION ALL SELECT 79 UNION ALL 
              SELECT 80 UNION ALL SELECT 81 UNION ALL SELECT 82 UNION ALL SELECT 83 UNION ALL SELECT 84 UNION ALL 
              SELECT 85 UNION ALL SELECT 86 UNION ALL SELECT 87 UNION ALL SELECT 88 UNION ALL SELECT 89 UNION ALL 
              SELECT 90 UNION ALL SELECT 91 UNION ALL SELECT 92 UNION ALL SELECT 93 UNION ALL SELECT 94 UNION ALL 
              SELECT 95 UNION ALL SELECT 96 UNION ALL SELECT 97 UNION ALL SELECT 98 UNION ALL SELECT 99 UNION ALL 
              SELECT 100
          ) numbers
          UNION ALL
          SELECT '101 and above', 101
      )
      SELECT 
          ab.age_bracket AS 'Age Bracket',
          COALESCE(SUM(CASE WHEN real_data.barangay = 'Sta. Rosa' THEN 1 ELSE 0 END), 0) AS 'Sta. Rosa',
          COALESCE(SUM(CASE WHEN real_data.barangay = 'Sta. Maria' THEN 1 ELSE 0 END), 0) AS 'Sta. Maria',
          COALESCE(SUM(CASE WHEN real_data.barangay = 'Sta. Lucia' THEN 1 ELSE 0 END), 0) AS 'Sta. Lucia',
          COALESCE(SUM(CASE WHEN real_data.barangay = 'San Rafael' THEN 1 ELSE 0 END), 0) AS 'San Rafael',
          COALESCE(SUM(CASE WHEN real_data.barangay = 'Yawran' THEN 1 ELSE 0 END), 0) AS 'Yawran',
          COALESCE(SUM(CASE WHEN real_data.barangay = 'Raele' THEN 1 ELSE 0 END), 0) AS 'Raele',
          COALESCE(COUNT(real_data.barangay), 0) AS 'Total'
      FROM age_brackets ab
      LEFT JOIN (
          SELECT
              CASE
                  WHEN TIMESTAMPDIFF(MONTH, p.birthdate, CURDATE()) < 12 THEN '0-11 months'
                  WHEN TIMESTAMPDIFF(YEAR, p.birthdate, CURDATE()) >= 101 THEN '101 and above'
                  ELSE CAST(TIMESTAMPDIFF(YEAR, p.birthdate, CURDATE()) AS CHAR)
              END AS age_bracket,
              h.barangay
          FROM population p
          INNER JOIN family_information fi ON p.family_id = fi.family_id
          INNER JOIN households h ON fi.household_id = h.household_id
          WHERE p.birthdate IS NOT NULL
          AND p.sex = 'Male'
      ) real_data ON real_data.age_bracket = ab.age_bracket
      GROUP BY ab.age_bracket, ab.sort_order

      UNION ALL

      SELECT 
          'TOTAL' AS 'Age Bracket',
          COALESCE(SUM(CASE WHEN real_data.barangay = 'Sta. Rosa' THEN 1 ELSE 0 END), 0) AS 'Sta. Rosa',
          COALESCE(SUM(CASE WHEN real_data.barangay = 'Sta. Maria' THEN 1 ELSE 0 END), 0) AS 'Sta. Maria',
          COALESCE(SUM(CASE WHEN real_data.barangay = 'Sta. Lucia' THEN 1 ELSE 0 END), 0) AS 'Sta. Lucia',
          COALESCE(SUM(CASE WHEN real_data.barangay = 'San Rafael' THEN 1 ELSE 0 END), 0) AS 'San Rafael',
          COALESCE(SUM(CASE WHEN real_data.barangay = 'Yawran' THEN 1 ELSE 0 END), 0) AS 'Yawran',
          COALESCE(SUM(CASE WHEN real_data.barangay = 'Raele' THEN 1 ELSE 0 END), 0) AS 'Raele',
          COALESCE(COUNT(real_data.barangay), 0) AS 'Total'
      FROM (
          SELECT h.barangay
          FROM population p
          INNER JOIN family_information fi ON p.family_id = fi.family_id
          INNER JOIN households h ON fi.household_id = h.household_id
          WHERE p.birthdate IS NOT NULL
          AND p.sex = 'Male'
      ) real_data

      ORDER BY 
          CASE 
              WHEN 'Age Bracket' = 'TOTAL' THEN 999
              WHEN 'Age Bracket' = '0-11 months' THEN 0
              WHEN 'Age Bracket' = '101 and above' THEN 101
              ELSE CAST('Age Bracket' AS UNSIGNED)
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


