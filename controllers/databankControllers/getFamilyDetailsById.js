import pool from '../../config/db.js';

export const getFamilyDetailsById = async (req, res) => {
  try {
    const { familyId } = req.params;

    const [familyDetailsRows] = await pool.query(`
      SELECT
        family_id         AS familyId,
        household_id      AS householdId,
        survey_id         AS surveyId,
        family_class      AS familyClass,
        monthly_income    AS monthlyIncome,
        irregular_income  AS irregularIncome,
        family_income     AS familyIncome
      FROM family_information
      WHERE family_id = ?
    `, [familyId]);

    const [serviceAvailedRows] = await pool.query(`
      SELECT
        date_service_availed  AS dateServiceAvailed,
        ngo_name              AS ngoName,
        service_availed       AS serviceAvailed,
        other_service_availed AS otherServiceAvailed,
        male_served           AS maleServed,
        female_served         AS femaleServed,
        how_service_help      AS howServiceHelp 
      FROM service_availed
      WHERE family_id = ?
    `, [familyId]);

    const [familyMembersRows] = await pool.query(`
      SELECT 
        resident_id AS residentId,
        family_id   AS familyId,
        CONCAT(
          first_name, ' ',
          IFNULL(CONCAT(middle_name, ' '), ''),
          last_name,
          IFNULL(CONCAT(' ', suffix), '')
        ) AS name,
        sex,
        DATE_FORMAT(birthdate, '%m-%d-%Y') AS birthdate,
        civil_status                       AS civilStatus,
        religion,
        relation_to_family_head            AS relationToFamilyHead,
        birthplace
      FROM population 
      WHERE family_id = ?
    `, [familyId]);

    const familyData = {
      details:  familyDetailsRows[0] ?? null,
      members:  familyMembersRows,
      services: serviceAvailedRows,
    };

    res.status(200).json({
      success: true,
      data: familyData
    });
  } catch (error) {
    console.error('Error fetching pwd data:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching pwd data', 
      error: error.message 
    });
  }
}


