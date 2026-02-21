import pool from '../../config/db.js';
import {
  parseIncome
} from '../../utils/numberUtils.js';
import { 
  formatDateForMySQL 
} from "../../utils/dateUtils.js";
import { 
  generateSeniorId,
  generateTemporaryResidentId 
} from '../../controllers/seniorIdApplicationControllers/generateId.js';
import { 
  base64ToBuffer, 
  saveToLocal,
  cleanupLocalStorageUploads 
} from '../../utils/fileUtils.js';


export const createSeniorIdApplicationService = async (
  formData,
  userId,
  files
) => {

  const connection = await pool.getConnection();

  const uploadedFiles = {
    seniorCitizenPhotoId: null,
    seniorCitizenSignature: null
  }

  const {
    residentId,
    personalInformation,
    professionalInformation,
    contactInformation,
    oscaInformation,
    familyComposition,
    seniorCitizenMedia
  } = formData

  const seniorCitizenId = `SC-${await generateSeniorId(connection)}`;

  try {
    await connection.beginTransaction();

    /////////////////////////////////////////////////////////////////////

    // GENERATE IDs

    const tempResidentId =  residentId 
      ? null
      : `T-RID-${await generateTemporaryResidentId(connection)}`;

    /////////////////////////////////////////////////////////////////////

    // UPLOAD IMAGES TO LOCAL STORAGE

    if (files?.seniorCitizenPhotoId?.[0]) {
      uploadedFiles.seniorCitizenPhotoId = await saveToLocal(
        files.seniorCitizenPhotoId[0].buffer,
        'senior-citizen-id-applications/photo-id',
        `photo-id-${seniorCitizenId}`,
        files.seniorCitizenPhotoId[0].mimetype
      );
    }

    if (seniorCitizenMedia?.seniorCitizenSignature) {
      const signatureBuffer = base64ToBuffer(seniorCitizenMedia.seniorCitizenSignature);
      uploadedFiles.seniorCitizenSignature = await saveToLocal(
        signatureBuffer,
        'senior-citizen-id-applications/applicant-signatures',
        `signature-${seniorCitizenId}.png`
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

    await insertSeniorIdApplicationData(connection, { 
      seniorCitizenId, 
      userId,
      residentId: residentId || tempResidentId, 
      seniorCitizenPhotoId: uploadedFiles.seniorCitizenPhotoId,
      seniorCitizenSignature: uploadedFiles.seniorCitizenSignature,
      familyComposition,
      oscaInformation
    });

    /////////////////////////////////////////////////////////////////////

    await connection.commit();
    return seniorCitizenId;
  } catch (error) {
    await connection.rollback();
    
    await cleanupLocalStorageUploads(uploadedFiles);

    console.error('❌ Submission failed:', {
      error: error.message,
      seniorCitizenId,
      userId,
      timestamp: new Date().toISOString()
    });

    throw error;
  } finally {
    connection.release();
  }
}

/////////////////////////////////////////////////////////////////////

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
      birthplace
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      first_name = VALUES(first_name),
      middle_name = VALUES(middle_name),
      last_name = VALUES(last_name),
      suffix = VALUES(suffix),
      sex = VALUES(sex),
      birthdate = VALUES(birthdate),
      civil_status = VALUES(civil_status),
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
      other_occupation,
      annual_income
    ) VALUES (?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      educational_attainment = VALUES(educational_attainment),
      skills = VALUES(skills),
      occupation = VALUES(occupation),
      other_occupation = VALUES(other_occupation),
      annual_income = VALUES(annual_income)`, 
    [
      residentId,
      data.professionalInformation.educationalAttainment,
      data.professionalInformation.employmentStatus || null,
      data.professionalInformation.occupation || null,
      data.professionalInformation.otherOccupation || null,
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
    ) VALUES (?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      street = VALUES(street),
      barangay = VALUES(barangay),
      contact_number = VALUES(contact_number)`, 
    [
      residentId,
      data.contactInformation.houseStreet,
      data.contactInformation.barangay,
      data.contactInformation.contactNumber || null
    ]
  );
} 

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

