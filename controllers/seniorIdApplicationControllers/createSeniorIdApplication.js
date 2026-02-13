import pool from '../../config/db.js';
import { 
  generateSeniorId, 
  generateTemporaryResidentId 
} from './generateId.js';
import { 
  deleteMultipleFromCloudinary,
  uploadToCloudinary 
} from '../../utils/cloudinaryUtils.js';
import { 
  base64ToBuffer 
} from '../../utils/fileUtils.js';
import { 
  insertApplicantInformationData, 
  insertSeniorIdApplicationData, 
  updateApplicantInformationData
} from '../../services/seniorIdApplicationService/createSeniorIdApplicationService.js';


export const createSeniorIdApplication = async (req, res) => {

  const connection = await pool.getConnection();

  let seniorCitizenSignature = null;
  let seniorCitizenPhotoId = null;

  try {
    await connection.beginTransaction();

    const { userId } = req.user;
    const formData = JSON.parse(req.body.formData);
    const {
      residentId,
      personalInformation,
      professionalInformation,
      contactInformation,
      oscaInformation,
      familyComposition,
      seniorCitizenMedia
    } = formData

    const scTempId = await generateSeniorId(connection);
    const seniorCitizenId = `SC-${scTempId}`;

    const tempId = await generateTemporaryResidentId(connection);
    const tempResidentId = `T-RID-${tempId}`;


    // UPLOAD IMAGES TO CLOUDINARY    
    if (req.files?.seniorCitizenPhotoId?.[0]) {
      console.log('Uploading photo id to Cloudinary...');
      seniorCitizenPhotoId = await uploadToCloudinary(
        req.files.seniorCitizenPhotoId[0].buffer,
        'seniorCitizen-id-applications/photo-id',
        req.files.seniorCitizenPhotoId[0].originalname
      );
      console.log('Senior Citizen Photo ID uploaded:', seniorCitizenPhotoId);
    }

    if (seniorCitizenMedia?.seniorCitizenSignature) {
      console.log('Uploading Senior Citizen signature to Cloudinary...');
      const signatureBuffer = base64ToBuffer(seniorCitizenMedia.seniorCitizenSignature);
      seniorCitizenSignature = await uploadToCloudinary(
        signatureBuffer,
        'seniorCitizen-id-applications/applicant-signatures',
        'applicant-signature'
      );
      console.log('Senior Citizen signature uploaded:', seniorCitizenSignature.url);
    }

    if (residentId) {
      console.log('Update')
      // APPLICANT INFORMATION - RESIDENT
      await updateApplicantInformationData(connection, { 
        residentId, 
        personalInformation, 
        professionalInformation,
        contactInformation
      });
    } else if (!residentId) {
      console.log('Resident')
      // APPLICANT INFORMATION - NOT RESIDENT
      await insertApplicantInformationData(connection, { 
        tempResidentId, 
        personalInformation, 
        professionalInformation,
        contactInformation
      });
    }
    
    // SENIOR CITIZEN ID APPLICATION
    await insertSeniorIdApplicationData(connection, { 
      seniorCitizenId, 
      userId,
      tempResidentId,
      residentId, 
      seniorCitizenPhotoId,
      seniorCitizenSignature,
      familyComposition,
      oscaInformation
    });

    await connection.commit();

    res.status(201).json({ 
      success: true,
      message: 'Application created successfully',
      seniorCitizenId: seniorCitizenId
    });
  } catch (error) {
    await connection.rollback();

    console.log('Database operation failed, cleaning up Cloudinary uploads...');
    
    try {
      const publicIdsToDelete = [];

      // Collect all public_ids that were successfully uploaded     
      if (seniorCitizenPhotoId?.publicId) {
        publicIdsToDelete.push(seniorCitizenPhotoId.publicId);
      }
      
      if (seniorCitizenSignature?.publicId) {
        publicIdsToDelete.push(seniorCitizenSignature.publicId);
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