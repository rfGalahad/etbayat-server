import pool from '../../config/db.js';

export const getAllStats = async (req, res) => {
  try {
    const { role, barangay } = req.user;
    const isBarangaySecretary = role === 'Barangay Secretary';
    const params = isBarangaySecretary ? [barangay] : [];
    const whereClause = isBarangaySecretary ? 'AND h.barangay = ?' : '';

    const currentQuery = `
      WITH resident_data AS (
        SELECT
          p.resident_id, p.family_id, p.sex, p.birthdate,
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
        COUNT(DISTINCT h.household_id) AS totalHousehold,
        COUNT(DISTINCT f.family_id)    AS totalFamily,
        COUNT(DISTINCT rd.resident_id) AS totalPopulation,
        SUM(CASE WHEN rd.sex = 'Male'   THEN 1 ELSE 0 END) AS totalMale,
        SUM(CASE WHEN rd.sex = 'Female' THEN 1 ELSE 0 END) AS totalFemale,
        SUM(CASE WHEN TIMESTAMPDIFF(YEAR, rd.birthdate, CURDATE()) BETWEEN 15 AND 30 THEN 1 ELSE 0 END) AS totalYouth,
        SUM(CASE WHEN TIMESTAMPDIFF(YEAR, rd.birthdate, CURDATE()) >= 60 THEN 1 ELSE 0 END) AS totalSeniorCitizen,
        SUM(rd.is_pwd)         AS totalPWD,
        SUM(rd.is_non_ivatan)  AS totalNonIvatan,
        SUM(rd.is_ofw)         AS totalOFW,
        SUM(rd.is_out_of_town) AS totalOutOfTown,
        SUM(rd.is_solo_parent) AS totalSoloParent,
        COUNT(DISTINCT CASE WHEN DATE(s.created_at) = CURDATE() THEN h.household_id END) AS householdToday,
        COUNT(DISTINCT CASE WHEN DATE(s.created_at) = CURDATE() THEN f.family_id    END) AS familyToday,
        COUNT(DISTINCT CASE WHEN DATE(s.created_at) = CURDATE() THEN rd.resident_id END) AS populationToday,
        SUM(CASE WHEN DATE(s.created_at) = CURDATE() AND rd.sex = 'Male'   THEN 1 ELSE 0 END) AS maleToday,
        SUM(CASE WHEN DATE(s.created_at) = CURDATE() AND rd.sex = 'Female' THEN 1 ELSE 0 END) AS femaleToday,
        SUM(CASE WHEN DATE(s.created_at) = CURDATE() AND TIMESTAMPDIFF(YEAR, rd.birthdate, CURDATE()) BETWEEN 15 AND 30 THEN 1 ELSE 0 END) AS youthToday,
        SUM(CASE WHEN DATE(s.created_at) = CURDATE() AND TIMESTAMPDIFF(YEAR, rd.birthdate, CURDATE()) >= 60 THEN 1 ELSE 0 END) AS seniorCitizenToday,
        SUM(CASE WHEN DATE(s.created_at) = CURDATE() AND rd.is_pwd         = 1 THEN 1 ELSE 0 END) AS pwdToday,
        SUM(CASE WHEN DATE(s.created_at) = CURDATE() AND rd.is_non_ivatan  = 1 THEN 1 ELSE 0 END) AS nonIvatanToday,
        SUM(CASE WHEN DATE(s.created_at) = CURDATE() AND rd.is_ofw         = 1 THEN 1 ELSE 0 END) AS ofwToday,
        SUM(CASE WHEN DATE(s.created_at) = CURDATE() AND rd.is_out_of_town = 1 THEN 1 ELSE 0 END) AS outOfTownToday,
        SUM(CASE WHEN DATE(s.created_at) = CURDATE() AND rd.is_solo_parent = 1 THEN 1 ELSE 0 END) AS soloParentToday
      FROM households h
      INNER JOIN family_information f ON h.household_id = f.household_id
      INNER JOIN surveys s            ON f.survey_id    = s.survey_id
      INNER JOIN resident_data rd     ON f.family_id    = rd.family_id
      WHERE 1=1 ${whereClause}
    `;

    const historyQuery = `
      WITH last_year_data AS (
        SELECT
          ph.resident_id, ph.family_id, ph.sex, ph.birthdate,
          MAX(CASE WHEN sch.classification_code = 'PWD'   THEN 1 ELSE 0 END) AS is_pwd,
          MAX(CASE WHEN sch.classification_code = 'IPULA' THEN 1 ELSE 0 END) AS is_non_ivatan,
          MAX(CASE WHEN sch.classification_code = 'OFW'   THEN 1 ELSE 0 END) AS is_ofw,
          MAX(CASE WHEN sch.classification_code = 'OT'    THEN 1 ELSE 0 END) AS is_out_of_town,
          MAX(CASE WHEN sch.classification_code = 'SP'    THEN 1 ELSE 0 END) AS is_solo_parent
        FROM population_history ph
        LEFT JOIN social_classification_history sch
          ON ph.resident_id = sch.resident_id
          AND sch.survey_year = YEAR(CURDATE()) - 1
        WHERE ph.survey_year = YEAR(CURDATE()) - 1
          AND ph.resident_id LIKE 'RID%'
        GROUP BY ph.resident_id, ph.family_id, ph.sex, ph.birthdate
      )
      SELECT
        COUNT(DISTINCT hh.household_id)  AS lastYearHousehold,
        COUNT(DISTINCT fh.family_id)     AS lastYearFamily,
        COUNT(DISTINCT lyd.resident_id)  AS lastYearPopulation,
        SUM(CASE WHEN lyd.sex = 'Male'   THEN 1 ELSE 0 END) AS lastYearMale,
        SUM(CASE WHEN lyd.sex = 'Female' THEN 1 ELSE 0 END) AS lastYearFemale,
        SUM(CASE WHEN TIMESTAMPDIFF(YEAR, lyd.birthdate, CURDATE()) BETWEEN 15 AND 30 THEN 1 ELSE 0 END) AS lastYearYouth,
        SUM(CASE WHEN TIMESTAMPDIFF(YEAR, lyd.birthdate, CURDATE()) >= 60 THEN 1 ELSE 0 END) AS lastYearSeniorCitizen,
        SUM(lyd.is_pwd)         AS lastYearPWD,
        SUM(lyd.is_non_ivatan)  AS lastYearNonIvatan,
        SUM(lyd.is_ofw)         AS lastYearOFW,
        SUM(lyd.is_out_of_town) AS lastYearOutOfTown,
        SUM(lyd.is_solo_parent) AS lastYearSoloParent
      FROM households_history hh
      INNER JOIN family_information_history fh ON fh.household_id = hh.household_id
                                               AND fh.survey_year = hh.survey_year
      INNER JOIN last_year_data lyd            ON fh.family_id    = lyd.family_id
      WHERE hh.survey_year = YEAR(CURDATE()) - 1
      ${isBarangaySecretary ? 'AND hh.barangay = ?' : ''}
    `;

    const [current] = await pool.query(currentQuery, params);
    const [history] = await pool.query(historyQuery, isBarangaySecretary ? [barangay] : []);

    const hasHistory = history.length > 0 && history[0].lastYearPopulation > 0;
    
    res.status(200).json({
      success: true,
      data: current[0],
      dataHistory: hasHistory ? history : []  // empty array = no history data
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ success: false, message: 'Error fetching stats', error: error.message });
  }
};