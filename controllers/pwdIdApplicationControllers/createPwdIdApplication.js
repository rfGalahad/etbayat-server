import pool from '../../config/db.js';
import { 
  generatePwdId, 
  generateTemporaryResidentId 
} from './generateId.js';
import { 
  base64ToBuffer, 
  saveToLocal,
  cleanupLocalStorageUploads
} from '../../utils/helpers.js';
import { 
  insertApplicantInformationData, 
  insertPwdIdApplicationData, 
  updateApplicantInformationData
} from '../../services/pwdIdApplicationService/createPwdIdApplicationService.js';


export const createPwdIdApplication = async (req, res) => {

  const connection = await pool.getConnection();

  let pwdSignature = null;
  let pwdPhotoId = null;

  try {
    await connection.beginTransaction();

    const { userId } = req.user;
    const formData = JSON.parse(req.body.formData);
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

    const pwdId = personalInformation.pwdId;
    
    const tempId = await generateTemporaryResidentId(connection);
    const tempResidentId = `T-RID-${tempId}`;

    // UPLOAD IMAGES TO LOCAL STORAGE    
    if (req.files?.pwdPhotoId?.[0]) {
      console.log('Saving photo id to local storage...');
      pwdPhotoId = await saveToLocal(
        req.files.pwdPhotoId[0].buffer,
        'pwd-id-applications/photo-id',
        req.files.pwdPhotoId[0].originalname
      );
      console.log('PWD Photo ID saved:', pwdPhotoId.url);
    }

    if (pwdMedia?.pwdSignature) {
      console.log('Saving pwd signature to local storage...');
      const signatureBuffer = base64ToBuffer(pwdMedia.pwdSignature);
      pwdSignature = await saveToLocal(
        signatureBuffer,
        'pwd-id-applications/applicant-signatures',
        'applicant-signature.png'
      );
      console.log('PWD signature saved:', pwdSignature.url);
    }

    if (residentId) {
      console.log('Update')
      // APPLICANT INFORMATION - RESIDENT
      await updateApplicantInformationData(connection, { 
        residentId, 
        personalInformation, 
        professionalInformation,
        disabilityInformation,
        contactInformation,
        governmentIds
      });
    } else if (!residentId) {
      console.log('Resident')
      // APPLICANT INFORMATION - NOT RESIDENT
      await insertApplicantInformationData(connection, { 
        tempResidentId, 
        personalInformation, 
        professionalInformation,
        disabilityInformation,
        contactInformation,
        governmentIds
      });
    }
    
    // PWD ID APPLICATION
    await insertPwdIdApplicationData(connection, { 
      pwdId, 
      userId,
      tempResidentId,
      residentId, 
      pwdPhotoId,
      pwdSignature,
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

    await cleanupLocalStorageUploads({
      pwdPhotoId,
      pwdSignature
    });

    console.error('Error creating post:', error);

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

    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ 
        success: false,
        message: 'PWD ID already exists' 
      });
    }

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