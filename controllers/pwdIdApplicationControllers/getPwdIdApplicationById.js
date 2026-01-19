import pool from '../../config/db.js';

export const getPwdIdApplicationById = async (req, res) => {
  
  const connection = await pool.getConnection();

  try {
    const pwdId = req.params.pwdId;

    // GET RESIDENT ID
    const [pwdIdApplicationRows] = await connection.query(
      `SELECT 
        resident_id as residentId
      FROM pwd_id_applications
      WHERE pwd_id = ?`,
      [pwdId]
    );

    const residentId = pwdIdApplicationRows[0].residentId;

    /* =======================
       Parallel Queries
    ======================== */
    const [
      [personalInformationRows],
      [professionalInformationRows],
      [contactInformationRows],
      [disabilityInformationRows],
      [governmentIdsRows],
      [familyBackgroundRows],
      [accomplishedByRows],
      [certifiedPhysicianRows],
      [otherInforamtionRows],
      [pwdMediaRows]
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
          h.blood_type as bloodType
        FROM population p
        LEFT JOIN health_information h
          ON p.resident_id = h.resident_id
        INNER JOIN pwd_id_applications pa
          ON p.resident_id = pa.resident_id
        WHERE pa.resident_id = ?`,
        [residentId]
      ),

      // PROFESSIONAL INFORMATION
      connection.query(
        `SELECT
          educational_attainment as educationalAttainment,
          employment_status as employmentStatus,
          employment_type as employmentType,
          employment_category as employmentCategory,
          skills,
          occupation
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

      // DISABILITY INFORMATION
      connection.query(
        `SELECT
          disability_type as disabilityType,
          disability_cause as disabilityCause,
          disability_specific as disabilitySpecific
        FROM health_information
        WHERE resident_id = ?`,
        [residentId]
      ),

      // GOVERNMENT IDs
      connection.query(
        `SELECT
          sss as sssNumber,
          gsis as gsisNumber,
          psn as psnNumber,
          philhealth as philheathNumber,
          pagibig as pagibigNumber
        FROM government_ids
        WHERE resident_id = ?`,
        [residentId]
      ),

      // FAMILY BACKGROUND
      connection.query(`
        SELECT
          -- Father
          pf.first_name   AS fatherFirstName,
          pf.middle_name  AS fatherMiddleName,
          pf.last_name    AS fatherLastName,
          pf.suffix       AS fatherSuffix,

          -- Mother
          pm.first_name   AS motherFirstName,
          pm.middle_name  AS motherMiddleName,
          pm.last_name    AS motherLastName,
          pm.suffix       AS motherSuffix,

          -- Guardian
          pg.first_name   AS guardianFirstName,
          pg.middle_name  AS guardianMiddleName,
          pg.last_name    AS guardianLastName,
          pg.suffix       AS guardianSuffix

        FROM pwd_id_applications pa

        LEFT JOIN family_background fb_father
          ON pa.pwd_id = fb_father.pwd_id
          AND fb_father.role = 'Father'
        LEFT JOIN person pf
          ON fb_father.person_id = pf.person_id

        LEFT JOIN family_background fb_mother
          ON pa.pwd_id = fb_mother.pwd_id
          AND fb_mother.role = 'Mother'
        LEFT JOIN person pm
          ON fb_mother.person_id = pm.person_id

        LEFT JOIN family_background fb_guardian
          ON pa.pwd_id = fb_guardian.pwd_id
          AND fb_guardian.role = 'Guardian'
        LEFT JOIN person pg
          ON fb_guardian.person_id = pg.person_id

        WHERE pa.resident_id = ?;
        `, 
        [residentId]
      ),

      // ACCOMPLISHED BY
      connection.query(`
        SELECT
          ab.role as accomplishedBy,
          p.first_name as abFirstName,
          p.middle_name as abMiddleName,
          p.last_name as abLastName,
          p.suffix as abSuffix
        FROM pwd_id_applications pa
        LEFT JOIN accomplished_by ab
            ON pa.pwd_id = ab.pwd_id
        LEFT JOIN person p
            ON ab.person_id = p.person_id
        WHERE pa.resident_id = ?
      `, [residentId]
      ),

      // CERTIFIED PHYSICIAN
      connection.query(`
        SELECT
          cp.license_number AS licenseNumber,
          p.first_name      AS cpFirstName,
          p.middle_name     AS cpMiddleName,
          p.last_name       AS cpLastName,
          p.suffix          AS cpSuffix
        FROM pwd_id_applications pa
        LEFT JOIN physician cp
            ON pa.pwd_id = cp.pwd_id
        LEFT JOIN person p
            ON cp.person_id = p.person_id
        WHERE pa.resident_id = ?`,
        [residentId]
      ),

      // OTHER INFORMATION
      connection.query(`
        SELECT
          -- Processor Officer
          ppo.first_name   AS poFirstName,
          ppo.middle_name  AS poMiddleName,
          ppo.last_name    AS poLastName,
          ppo.suffix       AS poSuffix,

          -- Approver Officer
          pao.first_name   AS aoFirstName,
          pao.middle_name  AS aoMiddleName,
          pao.last_name    AS aoLastName,
          pao.suffix       AS aoSuffix,

          -- Encoder Officer
          pen.first_name   AS enFirstName,
          pen.middle_name  AS enMiddleName,
          pen.last_name    AS enLastName,
          pen.suffix       AS enSuffix,

          -- Application Info
          pa.reporting_unit AS reportingUnit,
          pa.control_number AS controlNumber

        FROM pwd_id_applications pa

        LEFT JOIN officers o_processor
            ON pa.pwd_id = o_processor.pwd_id
            AND o_processor.role = 'Processor'
        LEFT JOIN person ppo
            ON o_processor.person_id = ppo.person_id

        LEFT JOIN officers o_approver
            ON pa.pwd_id = o_approver.pwd_id
            AND o_approver.role = 'Approver'
        LEFT JOIN person pao
            ON o_approver.person_id = pao.person_id

        LEFT JOIN officers o_encoder
            ON pa.pwd_id = o_encoder.pwd_id
            AND o_encoder.role = 'Encoder'
        LEFT JOIN person pen
            ON o_encoder.person_id = pen.person_id

        WHERE pa.resident_id = ?`,
        [residentId]
      ) ,

      // PWD MEDIA
      connection.query(`
        SELECT
          pwd_photo_id_url as pwdPhotoIdPreview,
          pwd_photo_id_public_id as pwdPhotoIdPublicId,
          pwd_signature_url as pwdSignature,
          pwd_signature_public_id as pwdSignaturePublicId
        FROM pwd_id_applications
        WHERE resident_id = ?`,
        [residentId]
      )
    ]);

    const personalInformation = personalInformationRows[0] || {};
    const professionalInformation = professionalInformationRows[0] || {};
    const contactInformation = contactInformationRows[0] || {};
    const disabilityInformation = disabilityInformationRows[0] || {};
    const governmentIds = governmentIdsRows[0] || {};
    const familyBackground = familyBackgroundRows[0] || {};
    const accomplishedBy = accomplishedByRows[0] || {};
    const certifiedPhysician = certifiedPhysicianRows[0] || {};
    const otherInformation = otherInforamtionRows[0] || {};
    const pwdMedia = pwdMediaRows[0] || {};

    /* =======================
       Final Response
    ======================== */
    res.json({
      success: true,
      data: {
        residentId: residentId,
        pwdId: pwdId,
        personalInformation,
        professionalInformation,
        contactInformation,
        disabilityInformation,
        governmentIds,
        familyBackground,
        accomplishedBy,
        certifiedPhysician,
        otherInformation,
        pwdMedia
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
