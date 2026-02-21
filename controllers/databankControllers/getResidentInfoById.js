import pool from '../../config/db.js';

export const getResidentInfoById = async (req, res) => {
  try {
    const { residentId } = req.params;

    const [rows] = await pool.query(`
      SELECT
        p.resident_id as residentId,
        p.family_id as familyId,

        CONCAT(p.first_name, ' ', 
        IFNULL(CONCAT(SUBSTRING(p.middle_name, 1, 1), '. '), ''), 
        p.last_name, ' ', 
        IFNULL(p.suffix, '')) as fullName,

        p.sex,
        DATE_FORMAT(p.birthdate, '%m-%d-%Y') as birthdate,
        p.civil_status as civilStatus,
        p.religion,
        p.relation_to_family_head as relationToFamilyHead,
        p.birthplace, 

        pi.educational_attainment as educationalAttainment, 
        pi.skills,
        pi.occupation,
        pi.company,
        pi.other_occupation AS otherOccupation,
        pi.employment_status as employmentStatus,
        pi.employment_category as employmentCategory,
        pi.employment_type as employmentType,
        pi.monthly_income as monthlyIncome,
        pi.annual_income as annualIncome,

        ci.contact_number as contactNumber,
        ci.telephone_number as telephoneNumber,
        ci.email_address as emailAddress,

        hi.blood_type as bloodType,
        hi.health_status as healthStatus,
        hi.disability_type as disabilityType,
        hi.disability_cause as disabilityCause,
        hi.disability_specific as disabilitySpecific, 

        gi.sss as sssNumber,
        gi.gsis as gsisNumber,
        gi.pagibig as pagibigNumber,
        gi.psn as psnNumber,
        gi.philhealth as philhealthNumber,
        gi.philsys as philsysNumber,

        DATE_FORMAT(a.date_become_officer, '%m-%d-%Y') as dateBecomeOfficer,
        DATE_FORMAT(a.date_become_member, '%m-%d-%Y') as dateBecomeMember,
        a.organization_name as organizationName,

        -- Check if affiliation exists
        CASE 
          WHEN a.resident_id IS NOT NULL 
          THEN TRUE 
          ELSE FALSE 
        END as affiliated,

        ni.settlement_details as settlementDetails,
        ni.ethnicity,
        ni.place_of_origin as placeOfOrigin,
        ni.house_owner as houseOwner,

        -- Convert transient to boolean
        CASE 
          WHEN ni.transient = 1 
          THEN TRUE 
          ELSE FALSE 
        END as transient,

        -- Check if non_ivatan exists
        CASE 
          WHEN ni.resident_id IS NOT NULL 
          THEN TRUE 
          ELSE FALSE 
        END as nonIvatan,

        CASE
          WHEN ni.date_registered IS NOT NULL
          THEN 'YES'
          ELSE 'NO'
        END as isRegistered,

        DATE_FORMAT(ni.date_registered, '%m-%d-%Y') as dateRegistered

      FROM population p
      LEFT JOIN professional_information pi ON p.resident_id = pi.resident_id
      LEFT JOIN contact_information ci ON p.resident_id = ci.resident_id
      LEFT JOIN health_information hi ON p.resident_id = hi.resident_id
      LEFT JOIN government_ids gi ON p.resident_id = gi.resident_id
      LEFT JOIN affiliation a ON p.resident_id = a.resident_id
      LEFT JOIN non_ivatan ni ON p.resident_id = ni.resident_id
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

    console.log('Resident Data:', residentData);

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


