import pool from "../../config/db.js";
import { 
  base64ToBuffer,
  saveToLocal 
} from "../../utils/fileUtils.js";
import { 
  upsertApplicantInformationData
} from "./createPwdIdApplicationService.js";


export const updatePwdIdApplicationService = async (
  formData,
  pwdId,
  files
) => {

  const connection = await pool.getConnection();

  const uploadedFiles = {
    pwdSignature: null,
    pwdPhotoId: null
  }

  const {
    residentId,
    personalInformation,
    professionalInformation,
    disabilityInformation,
    contactInformation,
    governmentIds,
    familyBackground,
    accomplishedBy,
    certifiedPhysician,
    otherInformation,
    pwdMedia
  } = formData

  try {
    await connection.beginTransaction();

    /////////////////////////////////////////////////////////////////////

    // UPDATE IMAGES
    const isNewSignature = pwdMedia?.pwdSignature?.startsWith('data:image/');

    // PHOTO ID
    if (files?.pwdPhotoId?.[0]) {
      uploadedFiles.pwdPhotoId = await saveToLocal(
        files.pwdPhotoId[0].buffer,
        'pwd-id-applications/photo-id',
        `photo-id-${pwdId}`,
        files.pwdPhotoId[0].mimetype
      );

      await connection.query(`
        UPDATE pwd_id_applications
        SET pwd_photo_id_url = ?
      `, [uploadedFiles.pwdPhotoId.url])  
    }

    // SIGNATURE
    if (isNewSignature) {
      const signatureBuffer = base64ToBuffer(pwdMedia.pwdSignature);
      uploadedFiles.pwdSignature = await saveToLocal(
        signatureBuffer,
        'pwd-id-applications/applicant-signatures',
        `signature-${pwdId}.png`
      );

      await connection.query(`
        UPDATE pwd_id_applications
        SET pwd_signature_url = ?
      `, [uploadedFiles.pwdSignature.url]
    )
    }

    /////////////////////////////////////////////////////////////////////

    // UPDATE APPLICATION

    await updatePwdIdApplicationData(connection, {
      pwdId,
      otherInformation,
      familyBackground,
      accomplishedBy,
      certifiedPhysician
    })

    /////////////////////////////////////////////////////////////////////

    // UPSERT APPLICATION

    await upsertApplicantInformationData(connection, { 
      residentId: residentId, 
      tempResidentId: null,                   
      personalInformation,  
      professionalInformation, 
      disabilityInformation, 
      contactInformation, 
      governmentIds 
    });

    /////////////////////////////////////////////////////////////////////

    await connection.commit();
    return pwdId;
  } catch (error) {
    await connection.rollback();

    console.error('❌ Update failed:', {
      error: error.message,
      pwdId,
      timestamp: new Date().toISOString()
    });

    throw error;
  } finally {
    connection.release();
  }
}

///////////////////////////////////////////////////////////////////////////////

const upsertPersonWithRole = async ({
  connection,
  pwdId,
  roleTable,
  roleColumn = 'role',
  roleValue,
  personData,
  extraColumns = {},
}) => {
  // 1. Check if role exists
  const [[existing]] = await connection.query(`
    SELECT person_id
    FROM ${roleTable}
    WHERE pwd_id = ?
    ${roleValue ? `AND ${roleColumn} = ?` : ''}
    LIMIT 1
  `, roleValue ? [pwdId, roleValue] : [pwdId]);

  if (existing) {
    // 2. UPDATE person
    await connection.query(`
      UPDATE person
      SET
        first_name = ?,
        middle_name = ?,
        last_name = ?,
        suffix = ?
      WHERE person_id = ?
    `, [
      personData.first_name,
      personData.middle_name,
      personData.last_name,
      personData.suffix,
      existing.person_id
    ]);

    // 3. UPDATE extra role data (if any)
    if (Object.keys(extraColumns).length) {
      const setClause = Object.keys(extraColumns)
        .map(k => `${k} = ?`)
        .join(', ');

      await connection.query(`
        UPDATE ${roleTable}
        SET ${setClause}
        WHERE person_id = ?
      `, [...Object.values(extraColumns), existing.person_id]);
    }

    return existing.person_id;
  }

  // 4. INSERT person
  const [personResult] = await connection.query(`
    INSERT INTO person (
      first_name,
      middle_name,
      last_name,
      suffix
    ) VALUES (?, ?, ?, ?)
  `, [
    personData.first_name,
    personData.middle_name,
    personData.last_name,
    personData.suffix
  ]);

  // 5. INSERT role
  await connection.query(`
    INSERT INTO ${roleTable} (
      pwd_id,
      person_id
      ${roleValue ? `, ${roleColumn}` : ''}
      ${Object.keys(extraColumns).length ? `, ${Object.keys(extraColumns).join(', ')}` : ''}
    ) VALUES (
      ?, ?
      ${roleValue ? `, ?` : ''}
      ${Object.keys(extraColumns).length ? `, ${Object.keys(extraColumns).map(() => '?').join(', ')}` : ''}
    )
  `, [
    pwdId,
    personResult.insertId,
    ...(roleValue ? [roleValue] : []),
    ...Object.values(extraColumns)
  ]);

  return personResult.insertId;
}

export const updatePwdIdApplicationData = async (connection, data) => {
  // UPDATE PWD ID APPLICATION
  await connection.query(`
    UPDATE pwd_id_applications 
    SET reporting_unit = ?,
        control_number =  ?
    WHERE pwd_id = ?
  `,
    [
      data.otherInformation.reportingUnit,
      data.otherInformation.controlNumber,
      data.pwdId
    ]
  );

  // FATHER
  await upsertPersonWithRole({
    connection,
    pwdId: data.pwdId,
    roleTable: 'family_background',
    roleValue: 'Father',
    personData: {
      first_name: data.familyBackground.fatherFirstName,
      middle_name: data.familyBackground.fatherMiddleName || null,
      last_name: data.familyBackground.fatherLastName,
      suffix: data.familyBackground.fatherSuffix || null,
    }
  });

  // MOTHER
  await upsertPersonWithRole({
    connection,
    pwdId: data.pwdId,
    roleTable: 'family_background',
    roleValue: 'Mother',
    personData: {
      first_name: data.familyBackground.motherFirstName,
      middle_name: data.familyBackground.motherMiddleName || null,
      last_name: data.familyBackground.motherLastName,
      suffix: data.familyBackground.motherSuffix || null,
    }
  });

  // GUARDIAN
  await upsertPersonWithRole({
    connection,
    pwdId: data.pwdId,
    roleTable: 'family_background',
    roleValue: 'Guardian',
    personData: {
      first_name: data.familyBackground.guardianFirstName,
      middle_name: data.familyBackground.guardianMiddleName || null,
      last_name: data.familyBackground.guardianLastName,
      suffix: data.familyBackground.guardianSuffix || null,
    }
  });

  // UPDATE ACCOMPLISHED BY
  await upsertPersonWithRole({
    connection,
    pwdId: data.pwdId,
    roleTable: 'accomplished_by',
    personData: {
      first_name: data.accomplishedBy.abFirstName,
      middle_name: data.accomplishedBy.abMiddleName || null,
      last_name: data.accomplishedBy.abLastName,
      suffix: data.accomplishedBy.abSuffix || null,
    },
    extraColumns: {
      role: data.accomplishedBy.accomplishedBy
    }
  });

  // UPDATE CERTIFIED PHYSICIAN
  await upsertPersonWithRole({
    connection,
    pwdId: data.pwdId,
    roleTable: 'physician',
    personData: {
      first_name: data.certifiedPhysician.cpFirstName,
      middle_name: data.certifiedPhysician.cpMiddleName || null,
      last_name: data.certifiedPhysician.cpLastName,
      suffix: data.certifiedPhysician.cpSuffix || null,
    },
    extraColumns: {
      license_number: data.certifiedPhysician.licenseNumber
    }
  });

  // PROCESSING OFFICER
  await upsertPersonWithRole({
    connection,
    pwdId: data.pwdId,
    roleTable: 'officers',
    roleValue: 'Processor',
    personData: {
      first_name: data.otherInformation.poFirstName,
      middle_name: data.otherInformation.poMiddleName || null,
      last_name: data.otherInformation.poLastName,
      suffix: data.otherInformation.poSuffix || null,
    }
  });

  // APPROVING OFFICER
  await upsertPersonWithRole({
    connection,
    pwdId: data.pwdId,
    roleTable: 'officers',
    roleValue: 'Approver',
    personData: {
      first_name: data.otherInformation.aoFirstName,
      middle_name: data.otherInformation.aoMiddleName || null,
      last_name: data.otherInformation.aoLastName,
      suffix: data.otherInformation.aoSuffix || null,
    }
  });

  // ENCODER
  await upsertPersonWithRole({
    connection,
    pwdId: data.pwdId,
    roleTable: 'officers',
    roleValue: 'Encoder',
    personData: {
      first_name: data.otherInformation.enFirstName,
      middle_name: data.otherInformation.enMiddleName || null,
      last_name: data.otherInformation.enLastName,
      suffix: data.otherInformation.enSuffix || null,
    }
  });
};

