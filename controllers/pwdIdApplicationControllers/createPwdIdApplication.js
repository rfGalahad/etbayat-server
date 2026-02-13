import pool from '../../config/db.js';
import { 
  generateTemporaryResidentId 
} from './generateId.js';
import {
  base64ToBuffer,
  saveToLocal,
  cleanupLocalStorageUploads
} from '../../utils/fileUtils.js'
import {  
  insertPwdIdApplicationData, 
  upsertApplicantInformationData
} from '../../services/pwdIdApplicationService/createPwdIdApplicationService.js';
import { 
  apiError 
} from '../../utils/apiResponse.js'

export const createPwdIdApplication = async (req, res) => {

  const connection = await pool.getConnection();

  const uploadedFiles = {
    pwdPhotoId: null,
    pwdSignature: null
  };

  try {
    await connection.beginTransaction();

    const { userId } = req.user;
    
    let formData;
    try {
      formData = JSON.parse(req.body.formData);
    } catch (parseError) {
      throw Object.assign(new SyntaxError('Invalid form data'), { 
        userMessage: 'The form data is invalid. Please try again.' 
      });
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

    if (!personalInformation?.pwdId) {
      return res.status(400).json(
        apiError({
          status: 400,
          code: 'MISSING_PWD_ID',
          message: 'PWD ID is required',
          userMessage: 'PWD ID is required to create an application.'
        })
      );
    }

    const pwdId = personalInformation.pwdId;
    const tempResidentId = residentId 
      ? null 
      : `T-RID-${await generateTemporaryResidentId(connection)}`;

    // UPLOAD IMAGES TO LOCAL STORAGE    
    if (req.files?.pwdPhotoId?.[0]) {
      console.log('Saving photo id to local storage...');
      uploadedFiles.pwdPhotoId = await saveToLocal(
        req.files.pwdPhotoId[0].buffer,
        'pwd-id-applications/photo-id',
        req.files.pwdPhotoId[0].originalname
      );
      console.log('PWD Photo ID saved:', uploadedFiles.pwdPhotoId.url);
    }

    if (pwdMedia?.pwdSignature) {
      console.log('Saving pwd signature to local storage...');
      const signatureBuffer = base64ToBuffer(pwdMedia.pwdSignature);
      uploadedFiles.pwdSignature = await saveToLocal(
        signatureBuffer,
        'pwd-id-applications/applicant-signatures',
        `${pwdId}-signature-${Date.now()}.png`
      );
      console.log('PWD signature saved:', uploadedFiles.pwdSignature.url);
    }

    await upsertApplicantInformationData(connection, { 
      residentId: residentId || null, 
      tempResidentId,                   
      personalInformation,  
      professionalInformation, 
      disabilityInformation, 
      contactInformation, 
      governmentIds 
    });
    
    // PWD ID APPLICATION
    await insertPwdIdApplicationData(connection, { 
      pwdId, 
      userId,
      residentId: residentId || tempResidentId, 
      pwdPhotoId: uploadedFiles.pwdPhotoId,
      pwdSignature: uploadedFiles.pwdSignature,
      otherInformation,
      familyBackground,
      accomplishedBy,
      certifiedPhysician
    });

    await connection.commit();

    res.status(201).json({ 
      success: true,
      message: 'Application created successfully',
      pwdId: pwdId
    });
  } catch (error) {
    await connection.rollback();

    await cleanupLocalStorageUploads(uploadedFiles);

    console.error('Error creating post:', error);

    // Duplicated Pwd Id 
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json(
        apiError({
          status: 409,
          code: 'DUPLICATE_PWD_ID',
          message: 'PWD ID already exists',
          userMessage: 'This PWD ID is already registered. Please use a different ID.'
        })
      );
    }

    // 🌐 Network / timeout (frontend usually triggers this, but still useful)
    if (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT') {
      return res.status(503).json(
        apiError({
          status: 503,
          code: 'NETWORK_ERROR',
          message: error.message,
          userMessage:
            'The connection was interrupted. Please check your internet connection and try again.'
        })
      );
    }

    // 🗄 MySQL / Database errors
    if (error.code?.startsWith('ER_')) {
      return res.status(500).json(
        apiError({   
          code: 'DATABASE_ERROR',
          message: error.message,
          userMessage:
            'We could not save your survey due to a server issue. No data was lost. Please try again.'
        })
      );
    }

    // 📦 Invalid JSON / bad payload
    if (error instanceof SyntaxError) {
      return res.status(400).json(
        apiError({
          status: 400,
          code: 'INVALID_PAYLOAD',
          message: error.message,
          userMessage:
            'Some survey data is invalid. Please reload the page and try again.'
        })
      );
    }

    // Generic Error
    return res.status(500).json(
      apiError({
        message: error.message,
        userMessage:
          'The server encountered an unexpected error. Please try again later.'
      })
    );
  } finally {
    connection.release();
  }
};