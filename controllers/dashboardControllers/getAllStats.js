import pool from '../../config/db.js';

export const getAllStats = async (req, res) => {
  try {
    const { role, barangay } = req.user;

    let query = '';
    let params = [];

    if (role === 'Barangay Secretary') {
      query = `
        SELECT
          h.barangay,

          COUNT(DISTINCT h.household_id) AS totalHousehold,
          COUNT(DISTINCT f.family_id) AS totalFamily,
          COUNT(DISTINCT p.resident_id) AS totalPopulation,

          SUM(CASE WHEN p.sex = 'Male' THEN 1 ELSE 0 END) AS totalMale,
          SUM(CASE WHEN p.sex = 'Female' THEN 1 ELSE 0 END) AS totalFemale,

          SUM(
            CASE 
              WHEN TIMESTAMPDIFF(YEAR, p.birthdate, CURDATE()) BETWEEN 15 AND 30 
              THEN 1 ELSE 0 
            END
          ) AS totalYouth,

          SUM(
            CASE 
              WHEN TIMESTAMPDIFF(YEAR, p.birthdate, CURDATE()) >= 60 
              THEN 1 ELSE 0 
            END
          ) AS totalSeniorCitizen,

          SUM(CASE WHEN sc.classification_code = 'PWD' THEN 1 ELSE 0 END) AS totalPWD,
          SUM(CASE WHEN sc.classification_code = 'IPULA' THEN 1 ELSE 0 END) AS totalNonIvatan,
          SUM(CASE WHEN sc.classification_code = 'OFW' THEN 1 ELSE 0 END) AS totalOFW,
          SUM(CASE WHEN sc.classification_code = 'OT' THEN 1 ELSE 0 END) AS totalOutOfTown,
          SUM(CASE WHEN sc.classification_code = 'SP' THEN 1 ELSE 0 END) AS totalSoloParent,

          SUM(
            CASE 
              WHEN DATE(s.created_at) = CURDATE() 
              THEN 1 ELSE 0 
            END
          ) AS populationToday

        FROM households h
        LEFT JOIN family_information f ON h.household_id = f.household_id
        LEFT JOIN surveys s ON f.survey_id = s.survey_id
        LEFT JOIN population p ON f.family_id = p.family_id
        LEFT JOIN social_classification sc ON p.resident_id = sc.resident_id

        WHERE h.barangay = ?
        AND p.resident_id LIKE 'RID%'

        GROUP BY h.barangay;
      `;

      params = [barangay];
    } else {
      // Admin / other roles
      query = `
        SELECT
          COUNT(DISTINCT h.household_id) AS totalHousehold,
          COUNT(DISTINCT f.family_id) AS totalFamily,
          COUNT(DISTINCT p.resident_id) AS totalPopulation,

          SUM(CASE WHEN p.sex = 'Male' THEN 1 ELSE 0 END) AS totalMale,
          SUM(CASE WHEN p.sex = 'Female' THEN 1 ELSE 0 END) AS totalFemale,

          SUM(
            CASE 
              WHEN TIMESTAMPDIFF(YEAR, p.birthdate, CURDATE()) BETWEEN 15 AND 30 
              THEN 1 ELSE 0 
            END
          ) AS totalYouth,

          SUM(
            CASE 
              WHEN TIMESTAMPDIFF(YEAR, p.birthdate, CURDATE()) >= 60 
              THEN 1 ELSE 0 
            END
          ) AS totalSeniorCitizen,

          SUM(CASE WHEN sc.classification_code = 'PWD' THEN 1 ELSE 0 END) AS totalPWD,
          SUM(CASE WHEN sc.classification_code = 'IPULA' THEN 1 ELSE 0 END) AS totalNonIvatan,
          SUM(CASE WHEN sc.classification_code = 'OFW' THEN 1 ELSE 0 END) AS totalOFW,
          SUM(CASE WHEN sc.classification_code = 'OT' THEN 1 ELSE 0 END) AS totalOutOfTown,
          SUM(CASE WHEN sc.classification_code = 'SP' THEN 1 ELSE 0 END) AS totalSoloParent,

          SUM(
            CASE 
              WHEN DATE(s.created_at) = CURDATE() 
              THEN 1 ELSE 0 
            END
          ) AS populationToday

        FROM households h
        LEFT JOIN family_information f ON h.household_id = f.household_id
        LEFT JOIN surveys s ON f.survey_id = s.survey_id
        LEFT JOIN population p ON f.family_id = p.family_id
        LEFT JOIN social_classification sc ON p.resident_id = sc.resident_id

        WHERE p.resident_id LIKE 'RID%';
      `;
    }

    const [rows] = await pool.query(query, params);

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