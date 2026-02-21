import pool from '../../config/db.js';

export const getAllStats = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        -- Population added today
        (SELECT COUNT(*)
        FROM population p
        JOIN family_information f ON p.family_id = f.family_id
        JOIN surveys s ON f.survey_id = s.survey_id
        WHERE DATE(s.created_at) = CURDATE()
        AND p.resident_id LIKE 'RID%'
        ) AS populationToday,

        -- Population added yesterday
        (SELECT COUNT(*)
        FROM population p
        JOIN family_information f ON p.family_id = f.family_id
        JOIN surveys s ON f.survey_id = s.survey_id
        WHERE DATE(s.created_at) = CURDATE() - INTERVAL 1 DAY
        AND p.resident_id LIKE 'RID%'
        ) AS populationYesterday,

        -- Total Households
        (SELECT COUNT(*) FROM households) AS totalHousehold,

        -- Total Family
        (SELECT COUNT(*) FROM family_information) AS totalFamily,

        -- Total Population
        (SELECT COUNT(*) FROM population WHERE resident_id LIKE 'RID%') AS totalPopulation,

        -- Total Male
        (SELECT COUNT(*) FROM population WHERE sex = 'Male' AND resident_id LIKE 'RID%') AS totalMale,

        -- Total Female
        (SELECT COUNT(*) FROM population WHERE sex = 'Female' AND resident_id LIKE 'RID%') AS totalFemale,

        -- Total Youth
        (SELECT COUNT(*) FROM population
          WHERE TIMESTAMPDIFF(YEAR, birthdate, CURDATE()) BETWEEN 15 AND 30 AND resident_id LIKE 'RID%'
        ) AS totalYouth,

        -- Total Senior Citizen
        (SELECT COUNT(*) FROM population
          WHERE TIMESTAMPDIFF(YEAR, birthdate, CURDATE()) >= 60 AND resident_id LIKE 'RID%'
        ) AS totalSeniorCitizen,

        -- Total PWD
        (SELECT COUNT(*) FROM social_classification
          WHERE classification_code = 'PWD' AND resident_id LIKE 'RID%'
        ) AS totalPWD,

        -- Total Non-Ivatan
        (SELECT COUNT(*) FROM social_classification
          WHERE classification_code = 'IPULA' AND resident_id LIKE 'RID%'
        ) AS totalNonIvatan,

        -- Total OFW
        (SELECT COUNT(*) FROM social_classification
          WHERE classification_code = 'OFW' AND resident_id LIKE 'RID%'
        ) AS totalOFW,

        -- Total Out of Town
        (SELECT COUNT(*) FROM social_classification
          WHERE classification_code = 'OT' AND resident_id LIKE 'RID%'
        ) AS totalOutOfTown,

        -- Total Solo Parent
        (SELECT COUNT(*) FROM social_classification
          WHERE classification_code = 'SP' AND resident_id LIKE 'RID%'
        ) AS totalSoloParent;
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
}


