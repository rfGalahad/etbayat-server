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
      birthplace
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
    [
      data.tempResidentId,
      data.personalInformation.firstName,
      data.personalInformation.middleName || null,
      data.personalInformation.lastName,
      data.personalInformation.suffix || null,
      data.personalInformation.sex,
      formatDateForMySQL(data.personalInformation.birthdate),
      data.personalInformation.civilStatus,
      data.personalInformation.birthplace || null
    ]
  );

  // PROFESSIONAL INFORMATION
  await connection.query(`
    INSERT INTO professional_information ( 
      resident_id,
      educational_attainment,
      skills,
      occupation,
      annual_income
    ) VALUES (?, ?, ?, ?, ?)`, 
    [
      data.tempResidentId,
      data.professionalInformation.educationalAttainment,
      data.professionalInformation.skills,
      data.professionalInformation.occupation,
      parseIncome(data.professionalInformation.annualIncome)
    ]
  );

  // CONTACT INFORMATION
  await connection.query(`
    INSERT INTO contact_information (
      resident_id,
      street,
      barangay,
      contact_number
    ) VALUES (?, ?, ?, ?)`, 
    [
      data.tempResidentId,
      data.contactInformation.houseStreet,
      data.contactInformation.barangay,
      data.contactInformation.contactNumber || null
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
      data.personalInformation.birthplace || null,
      data.residentId
    ]
  );

  // PROFESSIONAL INFORMATION
  await connection.query(
    `UPDATE professional_information 
     SET educational_attainment = ?,
         skills = ?,
         occupation = ?,
         annual_income = ?
     WHERE resident_id = ?`, 
    [
      data.professionalInformation.educationalAttainment,
      data.professionalInformation.skills,
      data.professionalInformation.occupation,
      parseIncome(data.professionalInformation.annualIncome),
      data.residentId
    ]
  );

  // CONTACT INFORMATION
  await connection.query(
    `UPDATE contact_information 
     SET street = ?,
         barangay = ?,
         contact_number = ?
     WHERE resident_id = ?`, 
    [
      data.contactInformation.houseStreet || null,
      data.contactInformation.barangay,
      data.contactInformation.contactNumber || null,
      data.residentId
    ]
  );
};

export const insertSeniorIdApplicationData = async (connection, data) => {
  // SENIOR CITIZEN ID APPLICATION
  await connection.query(
    `INSERT INTO senior_citizen_id_applications (
      senior_citizen_id,
      user_id,
      resident_id,
      senior_citizen_photo_id_url,
      senior_citizen_photo_id_public_id,
      senior_citizen_signature_url,
      senior_citizen_signature_public_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      data.seniorCitizenId,
      data.userId,
      data.residentId ? data.residentId : data.tempResidentId,
      data.seniorCitizenPhotoId?.url || null,
      data.seniorCitizenPhotoId?.publicId || null,
      data.seniorCitizenSignature?.url || null,
      data.seniorCitizenSignature?.publicId || null
    ]
  );

  // OSCA INFORMATON
  await connection.query(
    `INSERT INTO osca_information (
      senior_citizen_id,
      association_name,
      date_elected_as_officer,
      position  
    ) VALUES (?, ?, ?, ?)`,
    [
      data.seniorCitizenId,
      data.oscaInformation.associationName || null,
      formatDateForMySQL(data.oscaInformation.dateElectedAsOfficer) || null,
      data.oscaInformation.position
    ]
  );

  // FAMILY COMPOSITION
  const values = data.familyComposition.map(member => [
    data.seniorCitizenId,
    member.firstName,
    member.middleName || null,
    member.lastName,
    member.suffix || null,
    member.sex,
    member.relationship,
    formatDateForMySQL(member.birthdate),
    member.civilStatus,
    member.occupation || null,
    parseIncome(member.annualIncome)
  ]);

  await connection.query(
    `INSERT INTO family_composition (
      senior_citizen_id,
      first_name,
      middle_name,
      last_name,
      suffix,
      sex,
      relationship,
      birthdate,
      civil_status,
      occupation,
      annual_income
    ) VALUES ?`,
    [values]
  );
};

