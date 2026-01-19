import pool from '../../config/db.js';
import cloudinary from '../../config/cloudinary.js';
import { base64ToBuffer } from '../../utils/helpers.js';
import { 
  syncAffiliatedMember, 
  syncContactInformation, 
  syncGovernmentId, 
  syncHealthInformation, 
  syncNonIvatanMember, 
  syncPopulation, 
  syncProfessionalInformation, 
  syncSocialClassifications,  
  updateFamilyData, 
  updateHouseholdData,  
  updateSurveyData
} from '../../services/surveyService/updateSurveyService.js';
import { uploadToCloudinary } from '../../utils/cloudinaryUpload.js';
import { prepareSurveyDataValues } from '../../utils/surveyDataTransformers.js';
import { CLASSIFICATIONS } from '../../constants/surveyConstants.js';

export const updateSurvey = async (req, res) => {

  const connection = await pool.getConnection();

  let houseImages = [];
  let respondentSignature = null;
  let respondentPhoto = null;
  
  try {
    await connection.beginTransaction();
    
    const { userId } = req.user;
    const formData = JSON.parse(req.body.formData);
    const {
      surveyId,
      householdId,
      familyId,
      familyInformation,
      familyProfile,
      expenses,
      householdInformation,
      waterInformation,
      livestock,
      farmlots,
      cropsPlanted,
      fruitBearingTrees,
      familyResources,
      appliancesOwn,
      amenities,
      communityIssues,
      serviceAvailed,
      acknowledgement
    } = formData

    // UPLOAD IMAGES TO CLOUDINARY    
    /*
    if (req.files?.houseImages) {
      console.log('Uploading house images to Cloudinary...');
      houseImages = await uploadMultipleToCloudinary(
        req.files.houseImages, 
        'surveys/house-images'
      );
      console.log('House images uploaded:', houseImages);
    }
    */

    if (req.files?.respondentPhoto?.[0]) {
      // REMOVE PUBLIC ID
      if(acknowledgement?.respondentSignatureId) {
        await cloudinary.uploader.destroy(acknowledgement?.respondentSignatureId);
      } else if (acknowledgement?.respondentPhotoId) {
        await cloudinary.uploader.destroy(acknowledgement?.respondentPhotoId);
      }
      
      // UPLOAD TO CLOUDINARY
      respondentPhoto = await uploadToCloudinary(
        req.files.respondentPhoto[0].buffer,
        'surveys/respondent-photos',
        req.files.respondentPhoto[0].originalname
      );

      console.log('Respondent photo uploaded:', respondentPhoto.url);
    }

    const isNewSignature =
      acknowledgement.respondentSignature?.startsWith('data:image/');

    if (isNewSignature) {
      // REMOVE PUBLIC ID
      if(acknowledgement?.respondentPhotoId) {
        await cloudinary.uploader.destroy(acknowledgement?.respondentPhotoId);
      } else if (acknowledgement?.respondentSignaturePublicId) {
        await cloudinary.uploader.destroy(acknowledgement?.respondentSignaturePublicId);
      }

      // UPLOAD TO CLOUDINARY
      const signatureBuffer = base64ToBuffer(acknowledgement.respondentSignature);
      respondentSignature = await uploadToCloudinary(
        signatureBuffer,
        'surveys/respondent-signatures',
        'respondent-signature'
      );

      console.log('Respondent signature uploaded:', respondentSignature.url);
    }
    
    ////////////////////////////////////////////////

    // UPDATE SURVEY DATA

    const surveyData = prepareSurveyDataValues(surveyId, {
      expenses,
      livestock,
      cropsPlanted,
      fruitBearingTrees,
      familyResources,
      appliancesOwn,
      amenities
    }) 

    await updateSurveyData(connection, {
      surveyId,
      respondent: familyInformation.respondent,
      respondentPhoto,
      respondentSignature,

      surveyData,
      farmlots,
      communityIssues
    });    
    
    
    ///////////////////////////////////////////////

    // UPDATE HOUSEHOLD DATA

    await updateHouseholdData(connection, {
      householdId,
      householdInformation,
      waterInformation
    });

    // HOUSE IMAGES

    ////////////////////////////////////////////////

    // UPDATE FAMILY DATA

    await updateFamilyData(connection, {
      familyId,
      familyInformation,
      serviceAvailed
    });

    ////////////////////////////////////////////////

    // UPDATE POPULATION / RESIDENT

    

    const updatedFamilyProfile =  await syncPopulation(
      connection, 
      familyId, 
      familyProfile
    );
    await syncSocialClassifications(
      connection, 
      updatedFamilyProfile, 
      CLASSIFICATIONS
    );  
    await syncProfessionalInformation(connection, updatedFamilyProfile);
    await syncContactInformation(connection, updatedFamilyProfile);
    await syncHealthInformation(connection, updatedFamilyProfile);
    await syncGovernmentId(connection, updatedFamilyProfile);
    await syncAffiliatedMember(connection, updatedFamilyProfile);
    await syncNonIvatanMember(connection, updatedFamilyProfile);

    ////////////////////////////////////////////////

    await connection.commit();

    return res.status(200).json({ 
      success: true,
      message: 'Survey updated successfully',
      surveyId: surveyId
    });
  } catch (error) {
    await connection.rollback();

    console.log('Database operation failed, cleaning up Cloudinary uploads...');
        
    try {
      const publicIdsToDelete = [];

      // Collect all public_ids that were successfully uploaded
      if (houseImages?.length > 0) {
        publicIdsToDelete.push(...houseImages.map(img => img.publicId));
      }
      
      if (respondentPhoto?.publicId) {
        publicIdsToDelete.push(respondentPhoto.publicId);
      }
      
      if (respondentSignature?.publicId) {
        publicIdsToDelete.push(respondentSignature.publicId);
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