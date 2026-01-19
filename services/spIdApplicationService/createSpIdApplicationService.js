import { formatDateForMySQL, parseIncome } from "../../utils/helpers.js";

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
      civil_status,
      religion,
      birthplace
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
    [
      data.tempResidentId,
      data.personalInformation.firstName,
      data.personalInformation.middleName || null,
      data.personalInformation.lastName,
      data.personalInformation.suffix || null,
      data.personalInformation.sex,
      formatDateForMySQL(data.personalInformation.birthdate),
      data.personalInformation.civilStatus,
      data.personalInformation.religion || null,
      data.personalInformation.birthplace || null
    ]
  );

  // SOCIAL CLASSIFICATION
  await connection.query(`
    INSERT INTO social_classification ( 
      resident_id,
      classification_code,
      classification_name
    ) VALUES (?, ?, ?)`, 
    [
      data.tempResidentId,
      'SP', 
      'Solo Parent'
    ]
  );

  // GOVERNMENT IDs
  await connection.query(`
    INSERT INTO government_ids ( 
      resident_id,
      philsys
    ) VALUES (?, ?)`, 
    [
      data.tempResidentId,
      data.personalInformation.philsysNumber || null
    ]
  );

  // PROFESSIONAL INFORMATION
  await connection.query(`
    INSERT INTO professional_information ( 
      resident_id,
      educational_attainment,
      employment_status,
      occupation,
      monthly_income,
      company
    ) VALUES (?, ?, ?, ?, ?, ?)`, 
    [
      data.tempResidentId,
      data.professionalInformation.educationalAttainment,
      data.professionalInformation.employmentStatus,
      data.professionalInformation.occupation,
      parseIncome(data.professionalInformation.monthlyIncome),
      data.professionalInformation.company || null
    ]
  );

  // CONTACT INFORMATION
  await connection.query(`
    INSERT INTO contact_information (
      resident_id,
      street,
      barangay,
      contact_number,
      email_address
    ) VALUES (?, ?, ?, ?, ?)`, 
    [
      data.tempResidentId,
      data.contactInformation.houseStreet,
      data.contactInformation.barangay,
      data.contactInformation.contactNumber || null,
      data.contactInformation.emailAddress || null
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
         civil_status = ?,
         religion = ?,
         birthplace = ?
     WHERE resident_id = ?`, 
    [
      data.personalInformation.firstName,
      data.personalInformation.middleName || null,
      data.personalInformation.lastName,
      data.personalInformation.suffix || null,
      data.personalInformation.sex,
      formatDateForMySQL(data.personalInformation.birthdate),
      data.personalInformation.civilStatus,
      data.personalInformation.religion || null,
      data.personalInformation.birthplace || null,
      data.residentId
    ]
  );

  // PROFESSIONAL INFORMATION
  await connection.query(
    `UPDATE professional_information 
     SET educational_attainment = ?,
         employment_status = ?,
         occupation = ?,
         monthly_income = ?,
         company = ?
     WHERE resident_id = ?`, 
    [
      data.professionalInformation.educationalAttainment,
      data.professionalInformation.employmentStatus,
      data.professionalInformation.occupation,
      parseIncome(data.professionalInformation.monthlyIncome),
      data.professionalInformation.company || null,
      data.residentId
    ]
  );

  // CONTACT INFORMATION
  await connection.query(
    `UPDATE contact_information 
     SET street = ?,
         barangay = ?,
         contact_number = ?,
         email_address = ?
     WHERE resident_id = ?`, 
    [
      data.contactInformation.houseStreet || null,
      data.contactInformation.barangay,
      data.contactInformation.contactNumber || null,
      data.contactInformation.emailAddress || null,
      data.residentId
    ]
  );

  // GOVERNMENT IDs
  await connection.query(
    `UPDATE government_ids 
     SET philsys = ?
     WHERE resident_id = ?`, 
    [
      data.personalInformation.philsysNumber || null,
      data.residentId
    ]
  );
};

export const insertSpIdApplicationData = async (connection, data) => {
  // SOLO PARENT ID APPLICATION
  await connection.query(
    `INSERT INTO solo_parent_id_applications (
      solo_parent_id,
      user_id,
      resident_id,
      solo_parent_photo_id_url,
      solo_parent_photo_id_public_id,
      solo_parent_signature_url,
      solo_parent_signature_public_id,
      pantawid_beneficiary,
      beneficiary_code,
      household_id,
      indigenous_person,
      indigenous_affiliation,
      lgbtq,
      pwd
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? ,?)`,
    [
      data.soloParentId,
      data.userId,
      data.residentId ? data.residentId : data.tempResidentId,
      data.soloParentPhotoId?.url || null,
      data.soloParentPhotoId?.publicId || null,
      data.soloParentSignature?.url || null,
      data.soloParentSignature?.publicId || null,
      data.personalInformation.pantawidBeneficiary,
      data.personalInformation.beneficiaryCode,
      data.personalInformation.householdId,
      data.personalInformation.indigenousPerson,
      data.personalInformation.indigenousAffiliation,
      data.personalInformation.lgbtq,
      data.personalInformation.pwd
    ]
  );

  // HOUSEHOLD COMPOSITION
  const values = data.householdComposition.map(member => [
    data.soloParentId,
    member.firstName,
    member.middleName || null,
    member.lastName,
    member.suffix || null,
    member.sex,
    member.relationship,
    formatDateForMySQL(member.birthdate),
    member.civilStatus,
    member.educationalAttainment,
    member.occupation || null,
    parseIncome(member.monthlyIncome)
  ]);

  await connection.query(
    `INSERT INTO household_composition (
      solo_parent_id,
      first_name,
      middle_name,
      last_name,
      suffix,
      sex,
      relationship,
      birthdate,
      civil_status,
      educational_attainment,
      occupation,
      monthly_income
    ) VALUES ?`,
    [values]
  );

  // PROBLEM / NEEDS
  await connection.query(
    `INSERT INTO problem_needs (
      solo_parent_id,
      cause_solo_parent,
      needs_solo_parent
    ) VALUES (?, ?, ?)`,
    [
      data.soloParentId,
      data.problemNeeds.causeSoloParent,
      data.problemNeeds.needsSoloParent
    ]
  );

  // EMERGENCY CONTACT
  await connection.query(
    `INSERT INTO emergency_contact (
      solo_parent_id,
      contact_name,
      relationship,
      contact_number,
      house_street,
      barangay
    ) VALUES (?, ?, ?, ?, ?, ?)`,
    [
      data.soloParentId,
      data.emergencyContact.contactName,
      data.emergencyContact.relationship,
      data.emergencyContact.contactNumber,
      data.emergencyContact.houseStreet,
      data.emergencyContact.barangay
    ]
  );
};

