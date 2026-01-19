import pool from '../../config/db.js';

export const getSpIdApplicationById = async (req, res) => {
  
  const connection = await pool.getConnection();

  try {
    const soloParentId = req.params.soloParentId;

    // GET RESIDENT ID
    const [soloParentIdApplicationRows] = await connection.query(
      `SELECT 
        resident_id as residentId
      FROM solo_parent_id_applications
      WHERE solo_parent_id = ?`,
      [soloParentId]
    );

    const residentId = soloParentIdApplicationRows[0].residentId;

    const [
      [personalInformationRows],
      [professionalInformationRows],
      [contactInformationRows],
      [householdComposition],
      [problemNeedsRows],
      [emergencyContactRows],
      [soloParentMediaRows]
    ] = await Promise.all([
      // PERSONAL INFORMATION
      connection.query(
        `SELECT
          p.first_name as firstName,
          p.middle_name as middleName,
          p.last_name as lastName,
          p.suffix,
          DATE_FORMAT(p.birthdate, '%m-%d-%Y') as birthdate,
          p.sex,
          p.civil_status as civilStatus,
          p.religion,
          p.birthplace,
          g.philsys as philsysNumber,


          CASE
            WHEN pa.pantawid_beneficiary =  1
            THEN TRUE
            ELSE FALSE
          END AS pantawidBeneficiary,

          pa.beneficiary_code as beneficiaryCode,
          pa.household_id as householdId,

          CASE
            WHEN pa.indigenous_person = 1
            THEN TRUE
            ELSE FALSE
          END AS indigenousPerson,

          pa.indigenous_affiliation as indigenousAffiliation,

          CASE
            WHEN pa.lgbtq = 1
            THEN TRUE
            ELSE FALSE
          END,

          CASE
            WHEN pa.pwd = 1
            THEN TRUE
            ELSE FALSE
          END

        FROM population p
        LEFT JOIN government_ids g
          ON p.resident_id = g.resident_id
        INNER JOIN solo_parent_id_applications pa
          ON p.resident_id = pa.resident_id
        WHERE pa.resident_id = ?`,
        [residentId]
      ),

      // PROFESSIONAL INFORMATION
      connection.query(
        `SELECT
          educational_attainment as educationalAttainment,
          employment_status as employmentStatus,
          occupation,
          company,
          monthly_income as monthlyIncome
        FROM professional_information
        WHERE resident_id = ?`,
        [residentId]
      ),

      // CONTACT INFORMATION
      connection.query(
        `SELECT
          street as houseStreet,
          barangay,
          telephone_number as landlineNumber,
          contact_number as contactNumber,
          email_address as emailAddress
        FROM contact_information
        WHERE resident_id = ?`,
        [residentId]
      ),

      // HOUSEHOLD COMPOSITION
      connection.query(`
        SELECT
          household_composition_id as householdCompositionId,
          first_name AS firstName,
          middle_name AS middle_name,
          last_name AS lastName,
          suffix,
          sex,
          relationship,
          DATE_FORMAT(birthdate, '%m-%d-%Y') as birthdate,
          civil_status AS civilStatus,
          educational_attainment AS educationalAttainment,
          occupation,
          monthly_income AS monthlyIncome
        FROM household_composition
        WHERE solo_parent_id = ?`,
        [soloParentId]
      ),

      // PROBLEM NEEDS
      connection.query(`
        SELECT 
          cause_solo_parent as causeSoloParent,
          needs_solo_parent as needsSoloParent
        FROM problem_needs
        WHERE solo_parent_id = ?`,
        [soloParentId]
      ),

      // EMERGENCY CONTACT
      connection.query(`
        SELECT
          contact_name as contactName,
          relationship,
          contact_number as contactNumber,
          house_street as houseStreet,
          barangay
        FROM emergency_contact
        WHERE solo_parent_id = ?`,
        [soloParentId]
      ),

      // SOLO PARENT MEDIA
      connection.query(`
        SELECT
          solo_parent_photo_id_url as soloParentPhotoIdPreview,
          solo_parent_photo_id_public_id as soloParentPhotoIdPublicId,
          solo_parent_signature_url as soloParentSignature,
          solo_parent_signature_public_id as soloParentSignaturePublicId
        FROM solo_parent_id_applications
        WHERE resident_id = ?`,
        [residentId]
      )
    ]);

    const personalInformation = personalInformationRows[0] || {};
    const professionalInformation = professionalInformationRows[0] || {};
    const contactInformation = contactInformationRows[0] || {};
    const problemNeeds = problemNeedsRows[0] || {};
    const emergencyContact = emergencyContactRows[0] || {};
    const soloParentMedia = soloParentMediaRows[0] || {};
   
    /* =======================
       Final Response
    ======================== */
    res.json({
      success: true,
      data: {
        residentId : residentId,
        personalInformation,
        professionalInformation,
        contactInformation,
        householdComposition,
        problemNeeds,
        emergencyContact,
        soloParentMedia
      }
    });
  } catch (error) {
    console.error('Error getting application:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  } finally {
    connection.release();
  }
};
