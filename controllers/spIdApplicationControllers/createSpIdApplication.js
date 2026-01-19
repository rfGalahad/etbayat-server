import pool from '../../config/db.js';
import { generateId } from './generateId.js';
import { 
  deleteMultipleFromCloudinary,
  uploadToCloudinary 
} from '../../utils/cloudinaryUpload.js';
import { base64ToBuffer } from '../../utils/helpers.js';
import { 
  insertApplicantInformationData, 
  insertSpIdApplicationData, 
  updateApplicantInformationData
} from '../../services/spIdApplicationService/createSpIdApplicationService.js';


export const createSpIdApplication = async (req, res) => {

  const connection = await pool.getConnection();

  let soloParentSignature = null;
  let soloParentPhotoId = null;

  try {
    await connection.beginTransaction();

    const { userId } = req.user;
    const formData = JSON.parse(req.body.formData);
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

    const tempId = await generateId(connection);
    const soloParentId = `SP-${tempId}`;
    const tempResidentId = `T-RID-${tempId}`;

    // UPLOAD IMAGES TO CLOUDINARY    
    if (req.files?.soloParentPhotoId?.[0]) {
      console.log('Uploading photo id to Cloudinary...');
      soloParentPhotoId = await uploadToCloudinary(
        req.files.soloParentPhotoId[0].buffer,
        'soloParent-id-applications/photo-id',
        req.files.soloParentPhotoId[0].originalname
      );
      console.log('Solo Parent Photo ID uploaded:', soloParentPhotoId);
    }

    if (soloParentMedia?.soloParentSignature) {
      console.log('Uploading solo parent signature to Cloudinary...');
      const signatureBuffer = base64ToBuffer(soloParentMedia.soloParentSignature);
      soloParentSignature = await uploadToCloudinary(
        signatureBuffer,
        'soloParent-id-applications/applicant-signatures',
        'applicant-signature'
      );
      console.log('Solo Parent signature uploaded:', soloParentSignature.url);
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
    
    // SOLO PARENT ID APPLICATION
    await insertSpIdApplicationData(connection, { 
      soloParentId, 
      userId,
      tempResidentId,
      residentId, 
      soloParentPhotoId,
      soloParentSignature,
      householdComposition,
      problemNeeds,
      emergencyContact,
      personalInformation
    });

    await connection.commit();

    res.status(201).json({ 
      success: true,
      message: 'Application created successfully',
      soloParentId: soloParentId
    });
  } catch (error) {
    await connection.rollback();

    console.log('Database operation failed, cleaning up Cloudinary uploads...');
    
    try {
      const publicIdsToDelete = [];

      // Collect all public_ids that were successfully uploaded     
      if (soloParentPhotoId?.publicId) {
        publicIdsToDelete.push(soloParentPhotoId.publicId);
      }
      
      if (soloParentSignature?.publicId) {
        publicIdsToDelete.push(soloParentSignature.publicId);
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