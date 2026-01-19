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
      data.professionalInformation.occupation || null,
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

export const updateSpIdApplicationData = async (connection, data) => {
  
  // SOLO PARENT ID APPLICATION
  await connection.query(
    `UPDATE solo_parent_id_applications
     SET
      solo_parent_photo_id_url = ?,
      solo_parent_photo_id_public_id = ?,
      solo_parent_signature_url = ?,
      solo_parent_signature_public_id = ?,
      pantawid_beneficiary = ?,
      beneficiary_code = ?,
      household_id = ?,
      indigenous_person = ?,
      indigenous_affiliation = ?,
      lgbtq = ?,
      pwd = ?
     WHERE solo_parent_id = ?`,
    [
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
      data.personalInformation.pwd,
      data.soloParentId
    ]
  );

  // DELETE existing household composition
  await connection.query(
    `DELETE FROM household_composition WHERE solo_parent_id = ?`,
    [data.soloParentId]
  );

  // RE-INSERT household composition
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

  // UPDATE PROBLEM NEEDS
  await connection.query(
    `UPDATE problem_needs
     SET
      cause_solo_parent = ?,
      needs_solo_parent = ?
     WHERE solo_parent_id = ?`,
    [
      data.problemNeeds.causeSoloParent,
      data.problemNeeds.needsSoloParent,
      data.soloParentId
    ]
  );

  // EMERGENCY CONTACT
  await connection.query(
    `UPDATE emergency_contact
     SET
      contact_name = ?,
      relationship = ?,
      contact_number = ?,
      house_street = ?,
      barangay = ?
     WHERE solo_parent_id = ?`,
    [
      data.emergencyContact.contactName,
      data.emergencyContact.relationship,
      data.emergencyContact.contactNumber,
      data.emergencyContact.houseStreet,
      data.emergencyContact.barangay,
      data.soloParentId
    ]
  );
};


  
