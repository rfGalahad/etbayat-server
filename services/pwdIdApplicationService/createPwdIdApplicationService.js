import { formatDateForMySQL } from "../../utils/helpers.js";

export const insertPwdIdApplicationData = async (connection, data) => {
  // PWD ID APPLICATION
  await connection.query(
    `INSERT INTO pwd_id_applications (
      pwd_id,
      user_id,
      resident_id,
      pwd_photo_id_url,
      pwd_photo_id_public_id,
      pwd_signature_url,
      pwd_signature_public_id,
      reporting_unit,
      control_number
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.pwdId,
      data.userId,
      data.residentId ? data.residentId : data.tempResidentId,
      data.pwdPhotoId?.url || null,
      data.pwdPhotoId?.publicId || null,
      data.pwdSignature?.url || null,
      data.pwdSignature?.publicId || null,
      data.otherInformation.reportingUnit,
      data.otherInformation.controlNumber
    ]
  );

  // FAMILY BACKGROUND
  const [fatherResult] = await connection.query(`
    INSERT INTO person (
      first_name,
      middle_name,
      last_name,
      suffix
    ) VALUES (?, ?, ?, ?)`,
    [
      data.familyBackground.fatherFirstName,
      data.familyBackground.fatherMiddleName || null,
      data.familyBackground.fatherLastName,
      data.familyBackground.fatherSuffix || null,
    ]
  );
  await connection.query(`
    INSERT INTO family_background (
      pwd_id,
      person_id,
      role
    ) VALUES (?, ?, ?)`,
    [
      data.pwdId,
      fatherResult.insertId,
      'Father'
    ]
  );

  const [motherResult] = await connection.query(`
    INSERT INTO person (
      first_name,
      middle_name,
      last_name,
      suffix
    ) VALUES (?, ?, ?, ?)`,
    [
      data.familyBackground.motherFirstName,
      data.familyBackground.motherMiddleName || null,
      data.familyBackground.motherLastName,
      data.familyBackground.motherSuffix || null,
    ]
  );
  await connection.query(`
    INSERT INTO family_background (
      pwd_id,
      person_id,
      role
    ) VALUES (?, ?, ?)`,
    [
      data.pwdId,
      motherResult.insertId,
      'Mother'
    ]
  );

  const [guardianResult] = await connection.query(`
    INSERT INTO person (
      first_name,
      middle_name,
      last_name,
      suffix
    ) VALUES (?, ?, ?, ?)`,
    [
      data.familyBackground.guardianFirstName,
      data.familyBackground.guardianMiddleName || null,
      data.familyBackground.guardianLastName,
      data.familyBackground.guardianSuffix || null,
    ]
  );
  await connection.query(`
    INSERT INTO family_background (
      pwd_id,
      person_id,
      role
    ) VALUES (?, ?, ?)`,
    [
      data.pwdId,
      guardianResult.insertId,
      'Guardian'
    ]
  );

  // ACCOMPLISHED BY
  const [accomplishedByResult] = await connection.query(`
    INSERT INTO person (
      first_name,
      middle_name,
      last_name,
      suffix
    ) VALUES (?, ?, ?, ?)`,
    [
      data.accomplishedBy.abFirstName,
      data.accomplishedBy.abMiddleName || null,
      data.accomplishedBy.abLastName,
      data.accomplishedBy.abSuffix || null,
    ]
  );
  await connection.query(`
    INSERT INTO accomplished_by (
      pwd_id,
      person_id,
      role
    ) VALUES (?, ?, ?)`,
    [
      data.pwdId,
      accomplishedByResult.insertId,
      data.accomplishedBy.accomplishedBy
    ]
  );

  // CERTIFIED PHYSICIAN
  const [physicianResult] = await connection.query(`
    INSERT INTO person (
      first_name,
      middle_name,
      last_name,
      suffix
    ) VALUES (?, ?, ?, ?)`,
    [
      data.certifiedPhysician.cpFirstName,
      data.certifiedPhysician.cpMiddleName || null,
      data.certifiedPhysician.cpLastName,
      data.certifiedPhysician.cpSuffix || null,
    ]
  );
  await connection.query(`
    INSERT INTO physician (
      pwd_id,
      person_id,
      license_number
    ) VALUES (?, ?, ?)`,
    [
      data.pwdId,
      physicianResult.insertId,
      data.certifiedPhysician.licenseNumber
    ]
  );

  // OFFICERS
  const [processorResult] = await connection.query(`
    INSERT INTO person (
      first_name,
      middle_name,
      last_name,
      suffix
    ) VALUES (?, ?, ?, ?)`,
    [
      data.otherInformation.poFirstName,
      data.otherInformation.poMiddleName || null,
      data.otherInformation.poLastName,
      data.otherInformation.poSuffix || null,
    ]
  );
  await connection.query(`
    INSERT INTO officers (
      pwd_id,
      person_id,
      role
    ) VALUES (?, ?, ?)`,
    [
      data.pwdId,
      processorResult.insertId,
      'Processor'
    ]
  );

  const [approverResult] = await connection.query(`
    INSERT INTO person (
      first_name,
      middle_name,
      last_name,
      suffix
    ) VALUES (?, ?, ?, ?)`,
    [
      data.otherInformation.aoFirstName,
      data.otherInformation.aoMiddleName || null,
      data.otherInformation.aoLastName,
      data.otherInformation.aoSuffix || null,
    ]
  );
  await connection.query(`
    INSERT INTO officers (
      pwd_id,
      person_id,
      role
    ) VALUES (?, ?, ?)`,
    [
      data.pwdId,
      approverResult.insertId,
      'Approver'
    ]
  );

  const [encoderResult] = await connection.query(`
    INSERT INTO person (
      first_name,
      middle_name,
      last_name,
      suffix
    ) VALUES (?, ?, ?, ?)`,
    [
      data.otherInformation.poFirstName,
      data.otherInformation.poMiddleName || null,
      data.otherInformation.poLastName,
      data.otherInformation.poSuffix || null,
    ]
  );
  await connection.query(`
    INSERT INTO officers (
      pwd_id,
      person_id,
      role
    ) VALUES (?, ?, ?)`,
    [
      data.pwdId,
      encoderResult.insertId,
      'Encoder'
    ]
  );
};

export const insertApplicantInformationData = async (connection, data) => { 
  if (data.residentId) return;

  // POPULATION
  await connection.query(`
    INSERT INTO population ( 
      resident_id,
      first_name,
      middle_name,
      last_name,
      suffix,
      sex,
      birthdate,
      civil_status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, 
    [
      data.tempResidentId,
      data.personalInformation.firstName,
      data.personalInformation.middleName || null,
      data.personalInformation.lastName,
      data.personalInformation.suffix || null,
      data.personalInformation.sex,
      formatDateForMySQL(data.personalInformation.birthdate),
      data.personalInformation.civilStatus
    ]
  );

  // PWD CLASSIFICATION
  await connection.query(`
    INSERT INTO social_classification ( 
      resident_id,
      classification_code,
      classification_name
    ) VALUES (?, ?, ?)`, 
    [
      data.tempResidentId,
      'PWD',
      'Person with Disability'
    ]
  );

  // PROFESSIONAL INFORMATION
  await connection.query(`
    INSERT INTO professional_information ( 
      resident_id,
      educational_attainment,
      employment_status,
      employment_type,
      employment_category,
      skills,
      occupation
    ) VALUES (?, ?, ?, ?, ?, ?, ?)`, 
    [
      data.tempResidentId,
      data.professionalInformation.educationalAttainment,
      data.professionalInformation.employmentStatus,
      data.professionalInformation.employmentType,
      data.professionalInformation.employmentCategory,
      data.professionalInformation.skills,
      data.professionalInformation.occupation
    ]
  );

  // HEALTH INFORMATION
  await connection.query(`
    INSERT INTO health_information ( 
      resident_id,
      blood_type,
      disability_type,
      disability_cause,
      disability_specific
    ) VALUES (?, ?, ?, ?, ?)`, 
    [
      data.tempResidentId,
      data.personalInformation.bloodType || null,
      data.disabilityInformation.disabilityType,
      data.disabilityInformation.disabilityCause,
      data.disabilityInformation.disabilitySpecific
    ]
  );

  // CONTACT INFORMATION
  await connection.query(`
    INSERT INTO contact_information (
      resident_id,
      street,
      barangay,
      contact_number,
      telephone_number,
      email_address
    ) VALUES (?, ?, ?, ?, ?, ?)`, 
    [
      data.tempResidentId,
      data.contactInformation.houseStreet,
      data.contactInformation.barangay,
      data.contactInformation.contactNumber || null,
      data.contactInformation.landlineNumber || null,
      data.contactInformation.emailAddress || null
    ]
  );

  // GOVERNMENT IDs
  await connection.query(`
    INSERT INTO government_ids ( 
      resident_id,
      sss,
      gsis,
      psn,
      philhealth,
      pagibig
    ) VALUES (?, ?, ?, ?, ?, ?)`, 
    [
      data.tempResidentId,
      data.governmentIds.sssNumber || null,
      data.governmentIds.gsisNumber || null,
      data.governmentIds.psnNumber || null,
      data.governmentIds.philhealthNumber || null,
      data.governmentIds.pagibigNumber || null
    ]
  );
};

export const updateApplicantInformationData = async (connection, data) => { 
  if (!data.residentId) return;

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
  

  // CONTACT INFORMATION
  await connection.query(
    `UPDATE contact_information 
     SET contact_number = ?,
         telephone_number = ?,
         email_address = ?
     WHERE resident_id = ?`, 
    [
      data.contactInformation.contactNumber || null,
      data.contactInformation.landlineNumber || null,
      data.contactInformation.emailAddress || null,
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


export const upsertApplicantInformationData = async (connection, data) => {

  const residentId = data.residentId || data.tempResidentId;

  // POPULATION
  await connection.query(`
    INSERT INTO population ( 
      resident_id,
      first_name,
      middle_name,
      last_name,
      suffix,
      sex,
      birthdate,
      civil_status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      first_name = VALUES(first_name),
      middle_name = VALUES(middle_name),
      last_name = VALUES(last_name),
      suffix = VALUES(suffix),
      sex = VALUES(sex),
      birthdate = VALUES(birthdate),
      civil_status = VALUES(civil_status)`, 
    [
      residentId,
      data.personalInformation.firstName,
      data.personalInformation.middleName || null,
      data.personalInformation.lastName,
      data.personalInformation.suffix || null,
      data.personalInformation.sex,
      formatDateForMySQL(data.personalInformation.birthdate),
      data.personalInformation.civilStatus
    ]
  );

  // PWD CLASSIFICATION (only insert if new)
  if (!data.residentId) {
    await connection.query(`
      INSERT IGNORE INTO social_classification ( 
        resident_id,
        classification_code,
        classification_name
      ) VALUES (?, ?, ?)`, 
      [
        residentId,
        'PWD',
        'Person with Disability'
      ]
    );
  }

  // PROFESSIONAL INFORMATION
  await connection.query(`
    INSERT INTO professional_information ( 
      resident_id,
      educational_attainment,
      employment_status,
      employment_type,
      employment_category,
      skills,
      occupation
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      educational_attainment = VALUES(educational_attainment),
      employment_status = VALUES(employment_status),
      employment_type = VALUES(employment_type),
      employment_category = VALUES(employment_category),
      skills = VALUES(skills),
      occupation = VALUES(occupation)`, 
    [
      residentId,
      data.professionalInformation.educationalAttainment,
      data.professionalInformation.employmentStatus,
      data.professionalInformation.employmentType,
      data.professionalInformation.employmentCategory,
      data.professionalInformation.skills,
      data.professionalInformation.occupation
    ]
  );

  // HEALTH INFORMATION
  await connection.query(`
    INSERT INTO health_information ( 
      resident_id,
      blood_type,
      disability_type,
      disability_cause,
      disability_specific
    ) VALUES (?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      blood_type = VALUES(blood_type),
      disability_type = VALUES(disability_type),
      disability_cause = VALUES(disability_cause),
      disability_specific = VALUES(disability_specific)`, 
    [
      residentId,
      data.personalInformation.bloodType || null,
      data.disabilityInformation.disabilityType,
      data.disabilityInformation.disabilityCause,
      data.disabilityInformation.disabilitySpecific
    ]
  );

  // CONTACT INFORMATION
  await connection.query(`
    INSERT INTO contact_information ( 
      resident_id,
      street,
      barangay,
      contact_number,
      telephone_number,
      email_address
    ) ALUES (?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      street = VALUES(street),
      barangay = VALUES(barangay),
      contact_number = VALUES(contact_number),
      telephone_number = VALUES(telephone_number)
      email_address = VALUES(email_address)`, 
    [
      residentId,
      data.contactInformation.houseStreet,
      data.contactInformation.barangay,
      data.contactInformation.contactNumber || null,
      data.contactInformation.landlineNumber || null,
      data.contactInformation.emailAddress || null
    ]
  );

  // 
  
};

