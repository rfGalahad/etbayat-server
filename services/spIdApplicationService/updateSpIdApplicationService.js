import pool from '../../config/db.js';
import {
  parseIncome
} from '../../utils/numberUtils.js';
import { 
  formatDateForMySQL 
} from "../../utils/dateUtils.js";
import { 
  base64ToBuffer, 
  saveToLocal 
} from '../../utils/fileUtils.js';
import { 
  upsertApplicantInformationData 
} from './createSpIdApplicationService.js';


export const updateSpIdApplicationService = async (
  formData,
  soloParentId,
  files
) => {

  const connection = await pool.getConnection();

  const uploadedFiles = {
    soloParentPhotoId: null,
    soloParentSignature: null
  }

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

  try {
    await connection.beginTransaction();

    /////////////////////////////////////////////////////////////////////

    // UPDATE IMAGES
    const isNewSignature = soloParentMedia?.soloParentSignature?.startsWith('data:image/');

    // PHOTO ID
    if (files?.soloParentPhotoId?.[0]) {
      uploadedFiles.soloParentPhotoId = await saveToLocal(
        files.soloParentPhotoId[0].buffer,
        'solo-parent-id-applications/photo-id',
        `photo-id-${soloParentId}`,
        files.soloParentPhotoId[0].mimetype
      );

      await connection.query(`
        UPDATE solo_parent_id_applications
        SET solo_parent_photo_id_url = ?
      `, [uploadedFiles.soloParentPhotoId.url])  
    }

    // SIGNATURE
    if (isNewSignature) {
      const signatureBuffer = base64ToBuffer(soloParentMedia.soloParentSignature);
      uploadedFiles.soloParentSignature = await saveToLocal(
        signatureBuffer,
        'solo-parent-id-applications/applicant-signatures',
        `signature-${soloParentId}.png`
      );

      await connection.query(`
        UPDATE solo_parent_id_applications
        SET solo_parent_signature_url = ?
      `, [uploadedFiles.soloParentSignature.url]
      )
    }
    
    /////////////////////////////////////////////////////////////////////

    // UPDATE APPLICATION

    await updateSpIdApplicationData(connection, {
      residentId,
      soloParentId,
      personalInformation,
      householdComposition,
      problemNeeds,
      emergencyContact
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
    return soloParentId;
  } catch (error) {
    await connection.rollback();

    console.error('❌ Update failed:', {
      error: error.message,
      soloParentId,
      timestamp: new Date().toISOString()
    });

    throw error;
  } finally {
    connection.release();
  }
}

export const updateSpIdApplicationData = async (connection, data) => {
  
  // SOLO PARENT ID APPLICATION
  await connection.query(
    `UPDATE solo_parent_id_applications
     SET
      pantawid_beneficiary = ?,
      beneficiary_code = ?,
      household_id = ?,
      indigenous_person = ?,
      indigenous_affiliation = ?,
      lgbtq = ?,
      pwd = ?
     WHERE solo_parent_id = ?`,
    [
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

  
