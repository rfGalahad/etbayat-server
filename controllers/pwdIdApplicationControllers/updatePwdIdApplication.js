import pool from '../../config/db.js';
import cloudinary from '../../config/cloudinary.js';
import { base64ToBuffer } from '../../utils/helpers.js';
import { uploadToCloudinary } from '../../utils/cloudinaryUpload.js';
import { 
  updateApplicantInformationData, 
  updatePwdIdApplicationData 
} from '../../services/pwdIdApplicationService/updatePwdIdApplicationService.js';

export const updatePwdIdApplication = async (req, res) => {

  const connection = await pool.getConnection();

  let pwdSignature = null;
  let pwdPhotoId = null;
  
  try {
    await connection.beginTransaction();
    
    const { userId } = req.user;
    const { pwdId } = req.params;
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

    if (req.files?.pwdPhotoId?.[0]) {
      // REMOVE PUBLIC ID 
      if (pwdMedia?.pwdPhotoIdPublicId) {
        await cloudinary.uploader.destroy(pwdMedia?.pwdPhotoIdPublicId);
      }

      // UPLOAD TO CLOUDINARY
      pwdPhotoId = await uploadToCloudinary(
        req.files.pwdPhotoId[0].buffer,
        'pwd-id-applications/photo-id',
        req.files.pwdPhotoId[0].originalname
      );
    }

    const isNewSignature =
      pwdMedia.pwdSignature?.startsWith('data:image/');

    if (isNewSignature) {
      // REMOVE PUBLIC ID
       if (pwdMedia?.pwdSignaturePublicId) {
        await cloudinary.uploader.destroy(pwdMedia?.pwdSignaturePublicId);
      }

      // UPLOAD TO CLOUDINARY
      const signatureBuffer = base64ToBuffer(pwdMedia.pwdSignature);
      pwdSignature = await uploadToCloudinary(
        signatureBuffer,
        'pwd-id-applications/applicant-signatures',
        'applicant-signature'
      );
    }

    //----- UPLOAD TO DATABASE ------//

    await updatePwdIdApplicationData(connection, {
      pwdId,
      otherInformation,
      pwdSignature,
      pwdPhotoId,
      familyBackground,
      accomplishedBy,
      certifiedPhysician
    });

    await updateApplicantInformationData(connection, { 
      residentId, 
      personalInformation, 
      professionalInformation,
      disabilityInformation,
      contactInformation,
      governmentIds
    });

    await connection.commit();

    return res.status(200).json({ 
      success: true,
      message: 'PWD ID Application updated successfully',
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

    console.error('Error updating survey:', error);

    res.status(500).json({ 
      success: false,
      message: 'Server error'
    });
  } finally {
    connection.release();
  }
};