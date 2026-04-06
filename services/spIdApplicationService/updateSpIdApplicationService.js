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


export const updateSpIdApplicationService = async ({
  formData,
  oldSoloParentId,
  newSoloParentId,
  files
}) => {

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
        `photo-id-${newSoloParentId}`,
        files.soloParentPhotoId[0].mimetype
      );

      await connection.query(`
        UPDATE solo_parent_id_applications
        SET solo_parent_photo_id_url = ?
        WHERE solo_parent_id = ?
      `, [uploadedFiles.soloParentPhotoId.url, newSoloParentId])  
    }

    // SIGNATURE
    if (isNewSignature) {
      const signatureBuffer = base64ToBuffer(soloParentMedia.soloParentSignature);
      uploadedFiles.soloParentSignature = await saveToLocal(
        signatureBuffer,
        'solo-parent-id-applications/applicant-signatures',
        `signature-${newSoloParentId}.png`
      );

      await connection.query(`
        UPDATE solo_parent_id_applications
        SET solo_parent_signature_url = ?
        WHERE solo_parent_id = ?
      `, [uploadedFiles.soloParentSignature.url, newSoloParentId]
      )
    }
    
    /////////////////////////////////////////////////////////////////////

    // UPDATE APPLICATION

    await updateSpIdApplicationData(connection, {
      residentId,
      oldSoloParentId,
      newSoloParentId,
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
    return newSoloParentId;
  } catch (error) {
    await connection.rollback();

    console.error('❌ Update failed:', {
      error: error.message,
      newSoloParentId,
      timestamp: new Date().toISOString()
    });

    throw error;
  } finally {
    connection.release();
  }
}

export const updateSpIdApplicationData = async (connection, data) => {
  
  // UPDATE APPLICATION DATA
  await connection.query(`
    UPDATE solo_parent_id_applications 
    SET solo_parent_id = ?,
        pantawid_beneficiary = ?,
        beneficiary_code = ?,
        household_id = ?,
        indigenous_person = ?,
        indigenous_affiliation = ?,
        lgbtq = ?,
        renewal_date = ?
    WHERE solo_parent_id = ?
  `,
    [
      data.newSoloParentId,
      data.personalInformation.pantawidBeneficiary,
      data.personalInformation.beneficiaryCode,
      data.personalInformation.householdId,
      data.personalInformation.indigenousPerson,
      data.personalInformation.indigenousAffiliation,
      data.personalInformation.lgbtq,
      formatDateForMySQL(data.personalInformation.renewalDate),
      data.oldSoloParentId
    ]
  );

  if (data.personalInformation.pwd) {
    await connection.query(`
      INSERT INTO social_classification (
        resident_id, 
        classification_code, 
        classification_name
      ) VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE
        classification_code = VALUES(classification_code),
        classification_name = VALUES(classification_name)
    `, [
      data.residentId, 
      'PWD', 
      'Person with Disability'
    ]);
  } else {
    await connection.query(`
      DELETE FROM social_classification 
      WHERE resident_id = ? AND classification_code = 'PWD'
    `, [data.residentId]);
  }

  // DELETE existing household composition
  await connection.query(
    `DELETE FROM household_composition WHERE solo_parent_id = ?`,
    [data.newSoloParentId]
  );

  // RE-INSERT household composition
  const values = data.householdComposition.map(member => [
    data.newSoloParentId,
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
    member.otherOccupation || null,
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
      other_occupation,
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
      data.newSoloParentId
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
      data.newSoloParentId
    ]
  );
};

  
