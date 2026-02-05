import pool from '../../config/db.js';

export const getAllStats = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        -- Total Households
        (SELECT COUNT(*) FROM households) AS totalHousehold,

        -- Total Family
        (SELECT COUNT(*) FROM family_information) AS totalFamily,

        -- Total Population
        (SELECT COUNT(*) FROM population WHERE resident_id LIKE 'RID%') AS totalPopulation,

        -- Total Male
        (SELECT COUNT(*) FROM population WHERE sex = 'Male') AS totalMale,

        -- Total Female
        (SELECT COUNT(*) FROM population WHERE sex = 'Female') AS totalFemale,

        -- Total Youth
        (SELECT COUNT(*) FROM population
          WHERE TIMESTAMPDIFF(YEAR, birthdate, CURDATE()) BETWEEN 15 AND 30
        ) AS totalYouth,

        -- Total Senior Citizen
        (SELECT COUNT(*) FROM population
          WHERE TIMESTAMPDIFF(YEAR, birthdate, CURDATE()) >= 60
        ) AS totalSeniorCitizen,

        -- Total PWD
        (SELECT COUNT(*) FROM social_classification
          WHERE classification_code = 'PWD'
        ) AS totalPWD,

        -- Total Solo Parent
        (SELECT COUNT(*) FROM social_classification
          WHERE classification_code = 'SP'
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


