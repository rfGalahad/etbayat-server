import { formatDateForMySQL, parseIncome } from "../../utils/helpers.js";

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


export const updateSeniorIdApplicationData = async (connection, data) => {
  
  // SENIOR CITIZEN ID APPLICATION
  await connection.query(
    `UPDATE senior_citizen_id_applications
     SET
      senior_citizen_photo_id_url = ?,
      senior_citizen_photo_id_public_id = ?,
      senior_citizen_signature_url = ?,
      senior_citizen_signature_public_id = ?
     WHERE senior_citizen_id = ?`,
    [
      data.seniorCitizenPhotoId?.url || null,
      data.seniorCitizenPhotoId?.publicId || null,
      data.seniorCitizenSignature?.url || null,
      data.seniorCitizenSignature?.publicId || null,
      data.seniorCitizenId
    ]
  );

  // UPDATE OSCA INFORMATION
  await connection.query(`
    UPDATE osca_information 
    SET association_name = ?,
        date_elected_as_officer = ?,
        position = ?  
    WHERE senior_citizen_id = ?`,
    [
      data.oscaInformation.associationName || null,
      formatDateForMySQL(data.oscaInformation.dateElectedAsOfficer) || null,
      data.oscaInformation.position,
      data.seniorCitizenId,
    ]
  );

  // DELETE existing family composition
  await connection.query(
    `DELETE FROM family_composition WHERE senior_citizen_id = ?`,
    [data.seniorCitizenId]
  );

  // RE-INSERT family composition
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


  
