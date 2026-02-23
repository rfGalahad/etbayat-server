import pool from '../../config/db.js';

export const getAllStats = async (req, res) => {
  try {
    const { role, barangay } = req.user;
    const isBarangaySecretary = role === 'Barangay Secretary';

    console.log('ROLE', role);
    console.log('BARANGAY', barangay);

    const params = isBarangaySecretary ? [barangay] : [];

    const query = `
      WITH resident_data AS (
        SELECT
          p.resident_id,
          p.family_id,
          p.sex,
          p.birthdate,
          MAX(CASE WHEN sc.classification_code = 'PWD'   THEN 1 ELSE 0 END) AS is_pwd,
          MAX(CASE WHEN sc.classification_code = 'IPULA' THEN 1 ELSE 0 END) AS is_non_ivatan,
          MAX(CASE WHEN sc.classification_code = 'OFW'   THEN 1 ELSE 0 END) AS is_ofw,
          MAX(CASE WHEN sc.classification_code = 'OT'    THEN 1 ELSE 0 END) AS is_out_of_town,
          MAX(CASE WHEN sc.classification_code = 'SP'    THEN 1 ELSE 0 END) AS is_solo_parent
        FROM population p
        LEFT JOIN social_classification sc ON p.resident_id = sc.resident_id
        WHERE p.resident_id LIKE 'RID%'
        GROUP BY p.resident_id, p.family_id, p.sex, p.birthdate
      )

      SELECT
        ${isBarangaySecretary ? 'h.barangay,' : ''}

        -- Totals
        COUNT(DISTINCT h.household_id) AS totalHousehold,
        COUNT(DISTINCT f.family_id)    AS totalFamily,
        COUNT(DISTINCT rd.resident_id) AS totalPopulation,

        SUM(CASE WHEN rd.sex = 'Male'   THEN 1 ELSE 0 END) AS totalMale,
        SUM(CASE WHEN rd.sex = 'Female' THEN 1 ELSE 0 END) AS totalFemale,

        SUM(CASE WHEN TIMESTAMPDIFF(YEAR, rd.birthdate, CURDATE()) BETWEEN 15 AND 30 THEN 1 ELSE 0 END) AS totalYouth,
        SUM(CASE WHEN TIMESTAMPDIFF(YEAR, rd.birthdate, CURDATE()) >= 60             THEN 1 ELSE 0 END) AS totalSeniorCitizen,

        SUM(rd.is_pwd)         AS totalPWD,
        SUM(rd.is_non_ivatan)  AS totalNonIvatan,
        SUM(rd.is_ofw)         AS totalOFW,
        SUM(rd.is_out_of_town) AS totalOutOfTown,
        SUM(rd.is_solo_parent) AS totalSoloParent,

        -- Today's counts
        COUNT(DISTINCT CASE WHEN DATE(s.created_at) = CURDATE() THEN h.household_id END) AS householdToday,
        COUNT(DISTINCT CASE WHEN DATE(s.created_at) = CURDATE() THEN f.family_id    END) AS familyToday,
        COUNT(DISTINCT CASE WHEN DATE(s.created_at) = CURDATE() THEN rd.resident_id END) AS populationToday,

        SUM(CASE WHEN DATE(s.created_at) = CURDATE() AND rd.sex = 'Male'   THEN 1 ELSE 0 END) AS maleToday,
        SUM(CASE WHEN DATE(s.created_at) = CURDATE() AND rd.sex = 'Female' THEN 1 ELSE 0 END) AS femaleToday,

        SUM(CASE WHEN DATE(s.created_at) = CURDATE() AND TIMESTAMPDIFF(YEAR, rd.birthdate, CURDATE()) BETWEEN 15 AND 30 THEN 1 ELSE 0 END) AS youthToday,
        SUM(CASE WHEN DATE(s.created_at) = CURDATE() AND TIMESTAMPDIFF(YEAR, rd.birthdate, CURDATE()) >= 60             THEN 1 ELSE 0 END) AS seniorCitizenToday,

        SUM(CASE WHEN DATE(s.created_at) = CURDATE() AND rd.is_pwd         = 1 THEN 1 ELSE 0 END) AS pwdToday,
        SUM(CASE WHEN DATE(s.created_at) = CURDATE() AND rd.is_non_ivatan  = 1 THEN 1 ELSE 0 END) AS nonIvatanToday,
        SUM(CASE WHEN DATE(s.created_at) = CURDATE() AND rd.is_ofw         = 1 THEN 1 ELSE 0 END) AS ofwToday,
        SUM(CASE WHEN DATE(s.created_at) = CURDATE() AND rd.is_out_of_town = 1 THEN 1 ELSE 0 END) AS outOfTownToday,
        SUM(CASE WHEN DATE(s.created_at) = CURDATE() AND rd.is_solo_parent = 1 THEN 1 ELSE 0 END) AS soloParentToday

      FROM households h
      INNER JOIN family_information f ON h.household_id = f.household_id
      INNER JOIN surveys s            ON f.survey_id    = s.survey_id
      INNER JOIN resident_data rd     ON f.family_id    = rd.family_id

      WHERE 1=1
      ${isBarangaySecretary ? 'AND h.barangay = ?' : ''}

      ${isBarangaySecretary ? 'GROUP BY h.barangay' : ''}
    `;

    const [rows] = await pool.query(query, params);

    console.log('Stats Query Result:', rows);

    res.status(200).json({ success: true, data: rows });

  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ success: false, message: 'Error fetching stats', error: error.message });
  }
};