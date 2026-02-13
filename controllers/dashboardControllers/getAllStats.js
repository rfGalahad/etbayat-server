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


