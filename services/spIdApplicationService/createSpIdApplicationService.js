import {
  parseIncome
} from '../../utils/numberUtils.js';
import { 
  formatDateForMySQL 
} from "../../utils/dateUtils.js";
import pool from '../../config/db.js';
import { 
  generateSoloParentId, 
  generateTemporaryResidentId 
} from '../../controllers/spIdApplicationControllers/generateId.js';
import { 
  base64ToBuffer,
  cleanupLocalStorageUploads, 
  saveToLocal
} from '../../utils/fileUtils.js';


export const createSpIdApplicationService = async (
  formData,
  userId,
  files
) => {

  const connection = await pool.getConnection();

  const uploadedFiles = {
    soloParentPhotoId: null,
    soloParentSignature: null
  };

  const {
    residentId,
    personalInformation,
    professionalInformation,
    contactInformation,
    householdComposition,
    problemNeeds,
    emergencyContact,
    soloParentMedia
  } = formData

  const soloParentId = `SP-${await generateSoloParentId(connection)}`;

  try {
    await connection.beginTransaction();

    /////////////////////////////////////////////////////////////////////

    // GENERATE IDs

    const tempResidentId =  residentId 
      ? null
      : `T-RID-${await generateTemporaryResidentId(connection)}`;

    /////////////////////////////////////////////////////////////////////

    // UPLOAD IMAGES TO LOCAL STORAGE

    if (files?.soloParentPhotoId?.[0]) {
      uploadedFiles.soloParentPhotoId = await saveToLocal(
        files.soloParentPhotoId[0].buffer,
        'solo-parent-id-applications/photo-id',
        `photo-id-${soloParentId}`,
        files.soloParentPhotoId[0].mimetype
      );
    }

    if (soloParentMedia?.soloParentSignature) {
      const signatureBuffer = base64ToBuffer(soloParentMedia.soloParentSignature);
      uploadedFiles.soloParentSignature = await saveToLocal(
        signatureBuffer,
        'solo-parent-id-applications/applicant-signatures',
        `signature-${soloParentId}.png`
      );
    }

    /////////////////////////////////////////////////////////////////////

    // UPSERT APPLICANT

    await upsertApplicantInformationData(connection, {
      residentId: residentId || null,
      tempResidentId,
      personalInformation,
      professionalInformation,
      contactInformation
    })

    /////////////////////////////////////////////////////////////////////

    // INSERT APPLICATION

    await insertSpIdApplicationData(connection, { 
      soloParentId, 
      userId,
      residentId: residentId || tempResidentId, 
      soloParentPhotoId: uploadedFiles.soloParentPhotoId,
      soloParentSignature: uploadedFiles.soloParentSignature,
      householdComposition,
      problemNeeds,
      emergencyContact,
      personalInformation
    });

    /////////////////////////////////////////////////////////////////////

    await connection.commit();
    return soloParentId;
  } catch(error) {
    await connection.rollback();

    await cleanupLocalStorageUploads(uploadedFiles);

    console.error('❌ Submission failed:', {
      error: error.message,
      soloParentId,
      userId,
      timestamp: new Date().toISOString()
    });

    throw error;
  } finally {
    connection.release();
  }
}

///////////////////////////////////////////////////////////////////////

export const upsertApplicantInformationData = async (
  connection,
  data
) => {

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
      civil_status,
      religion,
      birthplace
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      first_name = VALUES(first_name),
      middle_name = VALUES(middle_name),
      last_name = VALUES(last_name),
      suffix = VALUES(suffix),
      sex = VALUES(sex),
      birthdate = VALUES(birthdate),
      civil_status = VALUES(civil_status),
      religion = VALUES(religion),
      birthplace = VALUES(birthplace)`, 
    [
      residentId,
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

  // SOLO PARENT CLASSIFICATION 
  if (!data.residentId) {
    await connection.query(`
      INSERT IGNORE INTO social_classification ( 
        resident_id,
        classification_code,
        classification_name
      ) VALUES (?, ?, ?)`, 
      [
        residentId,
        'SP',
        'Solo Parent'
      ]
    );
  }

  // PROFESSIONAL INFORMATION
  await connection.query(`
    INSERT INTO professional_information ( 
      resident_id,
      educational_attainment,
      employment_status,
      occupation,
      other_occupation,
      company,
      monthly_income
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      educational_attainment = VALUES(educational_attainment),
      employment_status = VALUES(employment_status),
      occupation = VALUES(occupation),
      other_occupation = VALUES(other_occupation),
      company = VALUES(company),
      monthly_income = VALUES(monthly_income)`, 
    [
      residentId,
      data.professionalInformation.educationalAttainment,
      data.professionalInformation.employmentStatus || null,
      data.professionalInformation.occupation || null,
      data.professionalInformation.otherOccupation || null,
      data.professionalInformation.company || null,
      parseIncome(data.professionalInformation.monthlyIncome)
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
    ) VALUES (?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      street = VALUES(street),
      barangay = VALUES(barangay),
      contact_number = VALUES(contact_number),
      email_address = VALUES(email_address)`, 
    [
      residentId,
      data.contactInformation.houseStreet,
      data.contactInformation.barangay,
      data.contactInformation.contactNumber || null,
      data.contactInformation.emailAddress || null
    ]
  );

  // GOVERNMENT IDs
  await connection.query(`
    INSERT INTO government_ids ( 
      resident_id,
      philsys
    ) VALUES (?, ?)
    ON DUPLICATE KEY UPDATE
      philsys = VALUES(philsys)`, 
    [
      residentId,
      data.personalInformation.philsysNumber || null
    ]
  );
}

export const insertSpIdApplicationData = async (connection, data) => {
  // SOLO PARENT ID APPLICATION
  await connection.query(
    `INSERT INTO solo_parent_id_applications (
      solo_parent_id,
      user_id,
      resident_id,
      solo_parent_photo_id_url,
      solo_parent_signature_url,
      pantawid_beneficiary,
      beneficiary_code,
      household_id,
      indigenous_person,
      indigenous_affiliation,
      lgbtq,
      pwd
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.soloParentId,
      data.userId,
      data.residentId ? data.residentId : data.tempResidentId,
      data.soloParentPhotoId?.url || null,
      data.soloParentSignature?.url || null,
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

