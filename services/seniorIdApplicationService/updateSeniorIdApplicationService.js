import pool from '../../config/db.js';
import {
  parseIncome
} from '../../utils/numberUtils.js';
import { 
  formatDateForMySQL 
} from "../../utils/dateUtils.js";
import { 
  upsertApplicantInformationData 
} from './createSeniorIdApplicationService.js';
import { 
  base64ToBuffer, 
  saveToLocal 
} from '../../utils/fileUtils.js';


export const updateSeniorIdApplicationService = async (
  formData,
  seniorCitizenId,
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

  try {
    await connection.beginTransaction();

    /////////////////////////////////////////////////////////////////////

    // UPDATE IMAGES
    const isNewSignature = seniorCitizenMedia?.seniorCitizenSignature?.startsWith('data:image/');

    // PHOTO ID
    if (files?.seniorCitizenPhotoId?.[0]) {
      uploadedFiles.seniorCitizenPhotoId = await saveToLocal(
        files.seniorCitizenPhotoId[0].buffer,
        'senior-citizen-id-applications/photo-id',
        `photo-id-${seniorCitizenId}`,
        files.seniorCitizenPhotoId[0].mimetype
      );

      await connection.query(`
        UPDATE senior_citizen_id_applications
        SET senior_citizen_photo_id_url = ?
      `, [uploadedFiles.seniorCitizenPhotoId.url])  
    }

    // SIGNATURE
    if (isNewSignature) {
      const signatureBuffer = base64ToBuffer(seniorCitizenMedia.seniorCitizenSignature);
      uploadedFiles.seniorCitizenSignature = await saveToLocal(
        signatureBuffer,
        'senior-citizen-id-applications/applicant-signatures',
        `signature-${seniorCitizenId}.png`
      );

      await connection.query(`
        UPDATE senior_citizen_id_applications
        SET senior_citizen_signature_url = ?
      `, [uploadedFiles.seniorCitizenSignature.url]
      )
    }
    
    /////////////////////////////////////////////////////////////////////

    // UPDATE APPLICATION

    await updateSeniorIdApplicationData(connection, {
      residentId,
      seniorCitizenId,
      oscaInformation,
      familyComposition
    });

    /////////////////////////////////////////////////////////////////////

    // UPSERT APPLICANT

    await upsertApplicantInformationData(connection, {
      residentId: residentId,
      tempResidentId: null,
      personalInformation,
      professionalInformation,
      contactInformation
    })

    /////////////////////////////////////////////////////////////////////

    await connection.commit();
    return seniorCitizenId;
  } catch (error) {
    await connection.rollback();

    console.error('❌ Update failed:', {
      error: error.message,
      seniorCitizenId,
      timestamp: new Date().toISOString()
    });

    throw error;
  } finally {
    connection.release();
  }
}

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


  
