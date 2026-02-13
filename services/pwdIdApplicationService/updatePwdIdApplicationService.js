import { formatDateForMySQL } from "../../utils/dateUtils.js";

const upsertPersonWithRole = async ({
  connection,
  pwdId,
  roleTable,
  roleColumn = 'role',
  roleValue,
  personData,
  extraColumns = {},
}) => {
  // 1. Check if role exists
  const [[existing]] = await connection.query(`
    SELECT person_id
    FROM ${roleTable}
    WHERE pwd_id = ?
    ${roleValue ? `AND ${roleColumn} = ?` : ''}
    LIMIT 1
  `, roleValue ? [pwdId, roleValue] : [pwdId]);

  if (existing) {
    // 2. UPDATE person
    await connection.query(`
      UPDATE person
      SET
        first_name = ?,
        middle_name = ?,
        last_name = ?,
        suffix = ?
      WHERE person_id = ?
    `, [
      personData.first_name,
      personData.middle_name,
      personData.last_name,
      personData.suffix,
      existing.person_id
    ]);

    // 3. UPDATE extra role data (if any)
    if (Object.keys(extraColumns).length) {
      const setClause = Object.keys(extraColumns)
        .map(k => `${k} = ?`)
        .join(', ');

      await connection.query(`
        UPDATE ${roleTable}
        SET ${setClause}
        WHERE person_id = ?
      `, [...Object.values(extraColumns), existing.person_id]);
    }

    return existing.person_id;
  }

  // 4. INSERT person
  const [personResult] = await connection.query(`
    INSERT INTO person (
      first_name,
      middle_name,
      last_name,
      suffix
    ) VALUES (?, ?, ?, ?)
  `, [
    personData.first_name,
    personData.middle_name,
    personData.last_name,
    personData.suffix
  ]);

  // 5. INSERT role
  await connection.query(`
    INSERT INTO ${roleTable} (
      pwd_id,
      person_id
      ${roleValue ? `, ${roleColumn}` : ''}
      ${Object.keys(extraColumns).length ? `, ${Object.keys(extraColumns).join(', ')}` : ''}
    ) VALUES (
      ?, ?
      ${roleValue ? `, ?` : ''}
      ${Object.keys(extraColumns).length ? `, ${Object.keys(extraColumns).map(() => '?').join(', ')}` : ''}
    )
  `, [
    pwdId,
    personResult.insertId,
    ...(roleValue ? [roleValue] : []),
    ...Object.values(extraColumns)
  ]);

  return personResult.insertId;
}

export const updatePwdIdApplicationData = async (connection, data) => {
  // UPDATE PWD ID APPLICATION
  await connection.query(`
    UPDATE pwd_id_applications 
    SET pwd_photo_id_url = ?,
        pwd_photo_id_public_id = ?,
        pwd_signature_url = ?,
        pwd_signature_public_id = ?,
        reporting_unit = ?,
        control_number =  ?
    WHERE pwd_id = ?
  `,
    [
      data.pwdPhotoId?.url || null,
      data.pwdPhotoId?.publicId || null,
      data.pwdSignature?.url || null,
      data.pwdSignature?.publicId || null,
      data.otherInformation.reportingUnit,
      data.otherInformation.controlNumber,
      data.pwdId
    ]
  );

  // UPDATE FAMILY BACKGROUND

  // FATHER
  await upsertPersonWithRole({
    connection,
    pwdId: data.pwdId,
    roleTable: 'family_background',
    roleValue: 'Father',
    personData: {
      first_name: data.familyBackground.fatherFirstName,
      middle_name: data.familyBackground.fatherMiddleName || null,
      last_name: data.familyBackground.fatherLastName,
      suffix: data.familyBackground.fatherSuffix || null,
    }
  });

  // MOTHER
  await upsertPersonWithRole({
    connection,
    pwdId: data.pwdId,
    roleTable: 'family_background',
    roleValue: 'Mother',
    personData: {
      first_name: data.familyBackground.motherFirstName,
      middle_name: data.familyBackground.motherMiddleName || null,
      last_name: data.familyBackground.motherLastName,
      suffix: data.familyBackground.motherSuffix || null,
    }
  });

  // GUARDIAN
  await upsertPersonWithRole({
    connection,
    pwdId: data.pwdId,
    roleTable: 'family_background',
    roleValue: 'Guardian',
    personData: {
      first_name: data.familyBackground.guardianFirstName,
      middle_name: data.familyBackground.guardianMiddleName || null,
      last_name: data.familyBackground.guardianLastName,
      suffix: data.familyBackground.guardianSuffix || null,
    }
  });

  // UPDATE ACCOMPLISHED BY
  await upsertPersonWithRole({
    connection,
    pwdId: data.pwdId,
    roleTable: 'accomplished_by',
    personData: {
      first_name: data.accomplishedBy.abFirstName,
      middle_name: data.accomplishedBy.abMiddleName || null,
      last_name: data.accomplishedBy.abLastName,
      suffix: data.accomplishedBy.abSuffix || null,
    },
    extraColumns: {
      role: data.accomplishedBy.accomplishedBy
    }
  });

  // UPDATE CERTIFIED PHYSICIAN
  await upsertPersonWithRole({
    connection,
    pwdId: data.pwdId,
    roleTable: 'physician',
    personData: {
      first_name: data.certifiedPhysician.cpFirstName,
      middle_name: data.certifiedPhysician.cpMiddleName || null,
      last_name: data.certifiedPhysician.cpLastName,
      suffix: data.certifiedPhysician.cpSuffix || null,
    },
    extraColumns: {
      license_number: data.certifiedPhysician.licenseNumber
    }
  });

  // UPDATE OFFICERS

  // PROCESSING OFFICER
  await upsertPersonWithRole({
    connection,
    pwdId: data.pwdId,
    roleTable: 'officers',
    roleValue: 'Processor',
    personData: {
      first_name: data.otherInformation.poFirstName,
      middle_name: data.otherInformation.poMiddleName || null,
      last_name: data.otherInformation.poLastName,
      suffix: data.otherInformation.poSuffix || null,
    }
  });

  // APPROVING OFFICER
  await upsertPersonWithRole({
    connection,
    pwdId: data.pwdId,
    roleTable: 'officers',
    roleValue: 'Approver',
    personData: {
      first_name: data.otherInformation.aoFirstName,
      middle_name: data.otherInformation.aoMiddleName || null,
      last_name: data.otherInformation.aoLastName,
      suffix: data.otherInformation.aoSuffix || null,
    }
  });

  // ENCODER
  await upsertPersonWithRole({
    connection,
    pwdId: data.pwdId,
    roleTable: 'officers',
    roleValue: 'Encoder',
    personData: {
      first_name: data.otherInformation.enFirstName,
      middle_name: data.otherInformation.enMiddleName || null,
      last_name: data.otherInformation.enLastName,
      suffix: data.otherInformation.enSuffix || null,
    }
  });
};

export const updateApplicantInformationData = async (connection, data) => { 
  if (!data.residentId) return;

  console.log('UPDATING APPLICANT INFORMATION...')

  // POPULATION
  await connection.query(
    `UPDATE population 
     SET first_name = ?,
         middle_name = ?,
         last_name = ?,
         suffix = ?,
         sex = ?,
         birthdate = ?,
         civil_status = ?
     WHERE resident_id = ?`, 
    [
      data.personalInformation.firstName,
      data.personalInformation.middleName || null,
      data.personalInformation.lastName,
      data.personalInformation.suffix || null,
      data.personalInformation.sex,
      formatDateForMySQL(data.personalInformation.birthdate),
      data.personalInformation.civilStatus,
      data.residentId
    ]
  );

  // PROFESSIONAL INFORMATION
  await connection.query(
    `UPDATE professional_information 
     SET educational_attainment = ?,
         employment_status = ?,
         employment_type = ?,
         employment_category = ?,
         skills = ?,
         occupation = ?
     WHERE resident_id = ?`, 
    [
      data.professionalInformation.educationalAttainment,
      data.professionalInformation.employmentStatus,
      data.professionalInformation.employmentType,
      data.professionalInformation.employmentCategory,
      data.professionalInformation.skills,
      data.professionalInformation.occupation,
      data.residentId
    ]
  );

  // HEALTH INFORMATION
  await connection.query(
    `UPDATE health_information 
     SET blood_type = ?,
         disability_type = ?,
         disability_cause = ?,
         disability_specific = ?
     WHERE resident_id = ?`, 
    [
      data.personalInformation.bloodType || null,
      data.disabilityInformation.disabilityType,
      data.disabilityInformation.disabilityCause,
      data.disabilityInformation.disabilitySpecific,
      data.residentId
    ]
  );

  // CONTACT INFORMATION
  await connection.query(
    `UPDATE contact_information 
     SET contact_number = ?,
         telephone_number = ?,
         email_address = ?,
         barangay = ?,
         street = ?
     WHERE resident_id = ?`, 
    [
      data.contactInformation.contactNumber || null,
      data.contactInformation.landlineNumber || null,
      data.contactInformation.emailAddress || null,
      data.contactInformation.barangay,
      data.contactInformation.houseStreet,
      data.residentId
    ]
  );

  // GOVERNMENT IDs
  await connection.query(
    `UPDATE government_ids 
     SET sss = ?,
         gsis = ?,
         psn = ?,
         philhealth = ?,
         pagibig = ?
     WHERE resident_id = ?`, 
    [
      data.governmentIds.sssNumber || null,
      data.governmentIds.gsisNumber || null,
      data.governmentIds.psnNumber || null,
      data.governmentIds.philhealthNumber || null,
      data.governmentIds.pagibigNumber || null,
      data.residentId
    ]
  );
};
