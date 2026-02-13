import pool from '../../config/db.js';
import cloudinary from '../../config/cloudinary.js';
import { 
  base64ToBuffer 
} from '../../utils/fileUtils.js';
import { 
  uploadToCloudinary 
} from '../../utils/cloudinaryUtils.js';
import { 
  updateApplicantInformationData,  
  updateSeniorIdApplicationData
} from '../../services/seniorIdApplicationService/updateSeniorIdApplicationService.js';

export const updateSeniorIdApplication = async (req, res) => {

  const connection = await pool.getConnection();

  let seniorCitizenSignature = null;
  let seniorCitizenPhotoId = null;
  
  try {
    await connection.beginTransaction();
    
    const { userId } = req.user;
    const { seniorCitizenId } = req.params;
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

    if (req.files?.seniorCitizenPhotoId?.[0]) {
      // REMOVE PUBLIC ID 
      if (seniorCitizenMedia?.seniorCitizenPhotoIdPublicId) {
        console.log(`Removing senior citizen's photo id from cloudinary...`);
        await cloudinary.uploader.destroy(seniorCitizenMedia?.seniorCitizenPhotoIdPublicId);
      }

      // UPLOAD TO CLOUDINARY
      seniorCitizenPhotoId = await uploadToCloudinary(
        req.files.seniorCitizenPhotoId[0].buffer,
        'seniorCitizen-id-applications/photo-id',
        req.files.seniorCitizenPhotoId[0].originalname
      );

      console.log(`Uploaded senior citizen's photo id:`, seniorCitizenPhotoId?.url);
    }

    const isNewSignature =
      seniorCitizenMedia.seniorCitizenSignature?.startsWith('data:image/');

    if (isNewSignature) {
      // REMOVE PUBLIC ID
       if (seniorCitizenMedia?.seniorCitizenSignaturePublicId) {
        console.log(`Removing senior citizen's signature from cloudinary...`);
        await cloudinary.uploader.destroy(seniorCitizenMedia?.seniorCitizenSignaturePublicId);
      }

      // UPLOAD TO CLOUDINARY
      const signatureBuffer = base64ToBuffer(seniorCitizenMedia.seniorCitizenSignature);
      seniorCitizenSignature = await uploadToCloudinary(
        signatureBuffer,
        'seniorCitizen-id-applications/applicant-signatures',
        'applicant-signature'
      );

      console.log(`Uploaded senior citizen's signature:`, seniorCitizenSignature?.url);
    }

    //----- UPLOAD TO DATABASE ------//

    await updateApplicantInformationData(connection, {
      residentId,
      personalInformation,
      professionalInformation,
      contactInformation
    });

    await updateSeniorIdApplicationData(connection, {
      residentId,
      seniorCitizenId,
      oscaInformation,
      familyComposition,
      seniorCitizenPhotoId,
      seniorCitizenSignature
    });

    await connection.commit();

    return res.status(200).json({ 
      success: true,
      message: 'Senior Citizen ID Application updated successfully',
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

    console.error('Error updating application:', error);

    res.status(500).json({ 
      success: false,
      message: 'Server error'
    });
  } finally {
    connection.release();
  }
};