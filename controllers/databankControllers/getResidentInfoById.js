import pool from '../../config/db.js';

export const getResidentInfoById = async (req, res) => {
  try {
    const { residentId } = req.params;

    const [rows] = await pool.query(`
      SELECT

        f.survey_id AS surveyId,

        p.resident_id AS residentId,
        p.family_id AS familyId,

        CONCAT(p.first_name, ' ', 
        IFNULL(CONCAT(SUBSTRING(p.middle_name, 1, 1), '. '), ''), 
        p.last_name, ' ', 
        IFNULL(p.suffix, '')) AS fullName,

        p.sex,
        DATE_FORMAT(p.birthdate, '%m-%d-%Y') AS birthdate,
        p.civil_status AS civilStatus,
        p.religion,
        p.relation_to_family_head AS relationToFamilyHead,
        p.birthplace, 

        pi.educational_attainment AS educationalAttainment, 
        pi.skills,
        pi.occupation,
        pi.company,
        pi.other_occupation AS otherOccupation,
        pi.employment_status AS employmentStatus,
        pi.employment_category AS employmentCategory,
        pi.employment_type AS employmentType,
        pi.monthly_income AS monthlyIncome,
        pi.annual_income AS annualIncome,

        ci.contact_number AS contactNumber,
        ci.telephone_number AS telephoneNumber,
        ci.email_address AS emailAddress,

        hi.blood_type AS bloodType,
        hi.health_status AS healthStatus,
        hi.disability_type AS disabilityType,
        hi.disability_cause AS disabilityCause,
        hi.disability_specific AS disabilitySpecific, 

        gi.sss AS sssNumber,
        gi.gsis AS gsisNumber,
        gi.pagibig AS pagibigNumber,
        gi.psn AS psnNumber,
        gi.philhealth AS philhealthNumber,
        gi.philsys AS philsysNumber,

        DATE_FORMAT(a.date_become_officer, '%m-%d-%Y') AS dateBecomeOfficer,
        DATE_FORMAT(a.date_become_member, '%m-%d-%Y') AS dateBecomeMember,
        a.organization_name AS organizationName,

        -- Check if affiliation exists
        CASE 
          WHEN a.resident_id IS NOT NULL 
          THEN TRUE 
          ELSE FALSE 
        END AS affiliated,

        ni.settlement_details AS settlementDetails,
        ni.ethnicity,
        ni.place_of_origin AS placeOfOrigin,
        ni.house_owner AS houseOwner,

        -- Convert transient to boolean
        CASE 
          WHEN ni.transient = 1 
          THEN TRUE 
          ELSE FALSE 
        END AS transient,

        -- Check if non_ivatan exists
        CASE 
          WHEN ni.resident_id IS NOT NULL 
          THEN TRUE 
          ELSE FALSE 
        END AS nonIvatan,

        CASE
          WHEN ni.date_registered IS NOT NULL
          THEN 'YES'
          ELSE 'NO'
        END AS isRegistered,

        DATE_FORMAT(ni.date_registered, '%m-%d-%Y') AS dateRegistered

      FROM population p
      LEFT JOIN professional_information pi ON p.resident_id = pi.resident_id
      LEFT JOIN contact_information ci      ON p.resident_id = ci.resident_id
      LEFT JOIN health_information hi       ON p.resident_id = hi.resident_id
      LEFT JOIN government_ids gi           ON p.resident_id = gi.resident_id
      LEFT JOIN affiliation a               ON p.resident_id = a.resident_id
      LEFT JOIN non_ivatan ni               ON p.resident_id = ni.resident_id
      LEFT JOIN family_information f        ON f.family_id   = p.family_id
      WHERE p.resident_id = ?`, 
      [residentId]
    );

    const [classificationRows] = await pool.query(
        `SELECT
          sc.resident_id as residentId,
          sc.classification_code as classificationCode,
          sc.classification_name as classificationName
        FROM social_classification sc
        INNER JOIN population p ON sc.resident_id = p.resident_id
        WHERE p.resident_id = ?`,
        [residentId]
    );

    const classificationMap = {
      'OSY': { field: 'youthCategory', value: 'OSY' },
      'IS': { field: 'youthCategory', value: 'IS' },
      'PWD': { field: 'pwd', value: true },
      'OT': { field: 'outOfTown', value: true },
      'SP': { field: 'soloParent', value: true },
      'OFW': { field: 'ofw', value: true },
    };

    const classificationData = classificationRows.map(row => {
      const classification = classificationMap[row.classificationCode];
      if (classification) {
        return {
          [classification.field]: classification.value
        };
      }
      return {};
    });

    const residentData = {
      ...rows[0],
      ...classificationData.reduce((acc, curr) => ({ ...acc, ...curr }), {})
    };

    res.status(200).json({
      success: true,
      data: residentData
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


