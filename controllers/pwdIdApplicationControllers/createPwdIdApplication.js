import pool from '../../config/db.js';
import { generateId } from './generateId.js';
import { 
  deleteMultipleFromCloudinary,
  uploadToCloudinary 
} from '../../utils/cloudinaryUpload.js';
import { base64ToBuffer } from '../../utils/helpers.js';
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

    const tempId = await generateId(connection);
    const pwdId = `PWD-${tempId}`;
    const tempResidentId = `T-RID-${tempId}`;

    // UPLOAD IMAGES TO CLOUDINARY    
    if (req.files?.pwdPhotoId?.[0]) {
      console.log('Uploading photo id to Cloudinary...');
      pwdPhotoId = await uploadToCloudinary(
        req.files.pwdPhotoId[0].buffer,
        'pwd-id-applications/photo-id',
        req.files.pwdPhotoId[0].originalname
      );
      console.log('PWD Photo ID uploaded:', pwdPhotoId);
    }

    if (pwdMedia?.pwdSignature) {
      console.log('Uploading pwd signature to Cloudinary...');
      const signatureBuffer = base64ToBuffer(pwdMedia.pwdSignature);
      pwdSignature = await uploadToCloudinary(
        signatureBuffer,
        'pwd-id-applications/applicant-signatures',
        'applicant-signature'
      );
      console.log('PWD signature uploaded:', pwdSignature.url);
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

    console.log('Database operation failed, cleaning up Cloudinary uploads...');
    
    try {
      const publicIdsToDelete = [];

      // Collect all public_ids that were successfully uploaded     
      if (pwdPhotoId?.publicId) {
        publicIdsToDelete.push(pwdPhotoId.publicId);
      }
      
      if (pwdSignature?.publicId) {
        publicIdsToDelete.push(pwdSignature.publicId);
      }

      // Delete all uploaded images from Cloudinary
      if (publicIdsToDelete.length > 0) {
        await deleteMultipleFromCloudinary(publicIdsToDelete);
        console.log(`Cleaned up ${publicIdsToDelete.length} images from Cloudinary`);
      }
    } catch (cleanupError) {
      // Log cleanup error but don't throw - we still want to return the original error
      console.error('Error cleaning up Cloudinary uploads:', cleanupError);
    }

    console.error('Error creating post:', error);

    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ 
        success: false,
        message: 'PWD ID already exists' 
      });
    }

    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  } finally {
    connection.release();
  }
};