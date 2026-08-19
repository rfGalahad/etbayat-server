import pool from '../../config/db.js';

export const getSoloParent = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        r.resident_id AS residentId,
        fam.family_id AS familyId,

        /* Parent full name and details */
        CONCAT_WS(' ',
            parent.first_name,
            parent.middle_name,
            parent.last_name,
            parent.suffix
        ) AS parentName,
        DATE_FORMAT(parent.birthdate, '%m-%d-%Y') AS parentBirthdate,
        TIMESTAMPDIFF(YEAR, parent.birthdate, CURDATE()) AS parentAge,
        parent.sex AS parentSex,
        pi_parent.educational_attainment AS parentEducationalAttainment,
        CASE
            WHEN pi_parent.occupation = 'Others'
                THEN pi_parent.other_occupation
            ELSE pi_parent.occupation
        END AS parentOccupation,

        /* Child name and details */
        CONCAT_WS(' ',
            r.first_name,
            r.middle_name,
            r.last_name,
            r.suffix
        ) AS childName,
        r.relation_to_family_head AS relationToFamilyHead,  
        DATE_FORMAT(r.birthdate, '%m-%d-%Y') AS birthdate,
        TIMESTAMPDIFF(YEAR, r.birthdate, CURDATE()) AS age,
        r.sex,
        pi_child.educational_attainment AS educationalAttainment,
        CASE
            WHEN pi_child.occupation = 'Others'
                THEN pi_child.other_occupation
            ELSE pi_child.occupation
        END AS occupation,

        sp.solo_parent_id AS soloParentId,

        CASE WHEN h.sitio_yawran = TRUE THEN 'Yawran' ELSE h.barangay END AS barangay

    FROM family_information fam

    JOIN population parent
        ON parent.family_id = fam.family_id
    AND parent.relation_to_family_head = 'Family Head'

    JOIN social_classification sc
        ON sc.resident_id = parent.resident_id
    AND sc.classification_code = 'SP'

    JOIN population r
        ON r.family_id = fam.family_id
    AND r.relation_to_family_head <> 'Family Head'
    AND TIMESTAMPDIFF(YEAR, r.birthdate, CURDATE()) < 22

    JOIN households h
        ON h.household_id = fam.household_id

    LEFT JOIN professional_information pi_child
        ON pi_child.resident_id = r.resident_id

    LEFT JOIN professional_information pi_parent
        ON pi_parent.resident_id = parent.resident_id

    LEFT JOIN solo_parent_id_applications sp
        ON sp.resident_id = parent.resident_id

    ORDER BY
        fam.family_id,
        r.birthdate;
    `);
    
    res.status(200).json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error fetching solo parent data:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching solo parent data', 
      error: error.message 
    });
  }
}


