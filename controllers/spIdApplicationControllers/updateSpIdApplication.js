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
  updateSpIdApplicationData
} from '../../services/spIdApplicationService/updateSpIdApplicationService.js';

export const updateSpIdApplication = async (req, res) => {

  const connection = await pool.getConnection();

  let soloParentSignature = null;
  let soloParentPhotoId = null;
  
  try {
    await connection.beginTransaction();
    
    const { userId } = req.user;
    const { soloParentId } = req.params;
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

    if (req.files?.soloParentPhotoId?.[0]) {
      // REMOVE PUBLIC ID 
      if (soloParentMedia?.soloParentPhotoIdPublicId) {
        console.log(`Removing solo parent's photo id from cloudinary...`);
        await cloudinary.uploader.destroy(soloParentMedia?.soloParentPhotoIdPublicId);
      }

      // UPLOAD TO CLOUDINARY
      soloParentPhotoId = await uploadToCloudinary(
        req.files.soloParentPhotoId[0].buffer,
        'soloParent-id-applications/photo-id',
        req.files.soloParentPhotoId[0].originalname
      );

      console.log(`Uploaded solo parent's photo id:`, soloParentPhotoId?.url);
    }

    const isNewSignature =
      soloParentMedia.soloParentSignature?.startsWith('data:image/');

    if (isNewSignature) {
      // REMOVE PUBLIC ID
       if (soloParentMedia?.soloParentSignaturePublicId) {
        console.log(`Removing solo parent's signature from cloudinary...`);
        await cloudinary.uploader.destroy(soloParentMedia?.soloParentSignaturePublicId);
      }

      // UPLOAD TO CLOUDINARY
      const signatureBuffer = base64ToBuffer(soloParentMedia.soloParentSignature);
      soloParentSignature = await uploadToCloudinary(
        signatureBuffer,
        'soloParent-id-applications/applicant-signatures',
        'applicant-signature'
      );

      console.log(`Uploaded solo parent's signature:`, soloParentSignature?.url);
    }

    //----- UPLOAD TO DATABASE ------//

    await updateApplicantInformationData(connection, {
      residentId,
      personalInformation,
      professionalInformation,
      contactInformation
    });

    await updateSpIdApplicationData(connection, {
      residentId,
      soloParentId,
      personalInformation,
      householdComposition,
      problemNeeds,
      emergencyContact,
      soloParentPhotoId,
      soloParentSignature
    });

    await connection.commit();

    return res.status(200).json({ 
      success: true,
      message: 'Solo Parent ID Application updated successfully',
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

    console.error('Error updating application:', error);

    res.status(500).json({ 
      success: false,
      message: 'Server error'
    });
  } finally {
    connection.release();
  }
};