import pool from '../../config/db.js';

export const getPopulation = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        p.resident_id AS residentId,

        p.last_name AS lastName,
        p.first_name AS firstName,
        p.middle_name AS middleName,
        p.suffix AS suffix,

        CONCAT(
          p.last_name, ', ',
          p.first_name,
          IFNULL(CONCAT(' ', p.middle_name), ''),
          IFNULL(CONCAT(' ', p.suffix), '')
        ) AS name,

        p.sex,
        DATE_FORMAT(p.birthdate, '%m-%d-%Y') AS birthdate,
        p.relation_to_family_head AS relationToFamilyHead,
        p.civil_status AS civilStatus,
        
        pi.educational_attainment AS educationalAttainment,
        pi.employment_status AS employmentStatus,
        CASE
            WHEN pi.occupation = 'Others' 
                THEN pi.other_occupation
            ELSE pi.occupation
        END AS occupation,

        ci.contact_number AS contactNumber,

        gi.philhealth AS philhealthId,

        (
          SELECT sp.solo_parent_id
          FROM solo_parent_id_applications sp
          WHERE sp.resident_id = p.resident_id
            AND sp.solo_parent_id IS NOT NULL
          LIMIT 1
        ) AS soloParentId,

        (
          SELECT sp.senior_citizen_id
          FROM senior_citizen_id_applications sp
          WHERE sp.resident_id = p.resident_id
            AND sp.senior_citizen_id IS NOT NULL
          LIMIT 1
        ) AS seniorCitizenId,

        (
          SELECT sp.pwd_id
          FROM pwd_id_applications sp
          WHERE sp.resident_id = p.resident_id
            AND sp.pwd_id IS NOT NULL
          LIMIT 1
        ) AS pwdId,

        CASE 
          WHEN EXISTS (
            SELECT 1 
            FROM social_classification sc 
            WHERE sc.resident_id = p.resident_id
            AND sc.classification_code = 'OSY'
          ) THEN TRUE
          ELSE FALSE
        END AS isOsy,

        CASE 
          WHEN EXISTS (
            SELECT 1 
            FROM social_classification sc 
            WHERE sc.resident_id = p.resident_id
            AND sc.classification_code = 'IS'
          ) THEN TRUE
          ELSE FALSE
        END AS isInSchool,

        CASE 
          WHEN EXISTS (
            SELECT 1 
            FROM social_classification sc 
            WHERE sc.resident_id = p.resident_id
            AND sc.classification_code = 'PWD'
          ) THEN TRUE
          ELSE FALSE
        END AS isPwd,

        CASE 
          WHEN EXISTS (
            SELECT 1 
            FROM social_classification sc 
            WHERE sc.resident_id = p.resident_id
            AND sc.classification_code = 'SP'
          ) THEN TRUE
          ELSE FALSE
        END AS isSoloParent,

        CASE 
          WHEN EXISTS (
            SELECT 1 
            FROM social_classification sc 
            WHERE sc.resident_id = p.resident_id
            AND sc.classification_code = 'OT'
          ) THEN TRUE
          ELSE FALSE
        END AS isOutOfTown,

        CASE 
          WHEN EXISTS (
            SELECT 1 
            FROM social_classification sc 
            WHERE sc.resident_id = p.resident_id
            AND sc.classification_code = 'OFW'
          ) THEN TRUE
          ELSE FALSE
        END AS isOfw,

        CASE 
          WHEN EXISTS (
            SELECT 1 
            FROM social_classification sc 
            WHERE sc.resident_id = p.resident_id
            AND sc.classification_code = 'IPULA'
          ) THEN TRUE
          ELSE FALSE
        END AS isNonIvatan,

        CASE
          WHEN p.verified_birthdate = 1 
          THEN TRUE
          ELSE FALSE
        END AS verifiedBirthdate,

        p.specify_id as specifyId,
        hi.barangay
        
      FROM population p
      LEFT JOIN family_information fi ON p.family_id = fi.family_id
      LEFT JOIN professional_information pi ON p.resident_id = pi.resident_id
      LEFT JOIN contact_information ci ON ci.resident_id = p.resident_id
      LEFT JOIN government_ids gi ON p.resident_id = gi.resident_id
      JOIN households hi ON fi.household_id = hi.household_id
      WHERE p.resident_id LIKE 'RID%'
      ORDER BY name ASC;
    `);
    
    res.status(200).json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error fetching population data:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching population data', 
      error: error.message 
    });
  }
}


