import pool from '../../config/db.js';
import cloudinary from '../../config/cloudinary.js';
import { base64ToBuffer, getNextFamilyId } from '../../utils/helpers.js';
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
import { prepareServiceAvailedValues, prepareSurveyDataValues } from '../../utils/surveyDataTransformers.js';
import { CLASSIFICATIONS } from '../../constants/surveyConstants.js';
import { generateHouseholdId } from './generateId.js';

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

    const tempHouseholdId = await generateHouseholdId(connection);
    let newHouseholdId = null;
    let newFamilyId = null;

    if (householdInformation.multipleFamily) {
      console.log('🏠 Multiple family household detected');
      console.log('Searching for existing family head:', {
        firstName: householdInformation.familyHeadFirstName,
        middleName: householdInformation.familyHeadMiddleName || null,
        lastName: householdInformation.familyHeadLastName,
        suffix: householdInformation.familyHeadSuffix || null
      });

      const [existingPerson] = await connection.query(`
        SELECT p.family_id, f.household_id
        FROM population p
        JOIN family_information f ON f.family_id = p.family_id
        WHERE p.first_name = ?
          AND (p.middle_name <=> ?)
          AND p.last_name = ?
          AND (p.suffix <=> ?)
          AND p.relation_to_family_head = 'Family Head'
        LIMIT 1
      `, [
        householdInformation.familyHeadFirstName,
        householdInformation.familyHeadMiddleName || null,
        householdInformation.familyHeadLastName,
        householdInformation.familyHeadSuffix || null
      ]);

      console.log('Query result for existing person:', existingPerson);

      if (existingPerson.length > 0) {
        console.log('✅ Existing family head found:', existingPerson[0]);

        newHouseholdId = existingPerson[0].household_id;

        // Get latest family_id under the same household
        const [latestFamily] = await connection.query(`
          SELECT family_id
          FROM family_information
          WHERE household_id = ?
          ORDER BY family_id DESC
          LIMIT 1
        `, [newHouseholdId]);

        console.log('Latest family in household:', latestFamily[0]);

        newFamilyId = getNextFamilyId(
          latestFamily[0]?.family_id,
          newHouseholdId.replace('HID-', '')
        );

        console.log('Generated new familyId:', familyId);

      } else {
        console.log('❌ Family head not found. Will not update household and family IDs.');
        console.log({ householdId, familyId });
      }
    }

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


    // UPDATE POPULATION / RESIDENT

    const updatedFamilyProfile =  await syncPopulation(
      connection, 
      familyId, 
      familyProfile,
      newFamilyId
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
    
    
    ///////////////////////////////////////////////

    // UPDATE FAMILY DATA

    const serviceAvailedValues = prepareServiceAvailedValues(
      newFamilyId, 
      serviceAvailed
    );

    await updateFamilyData(connection, {
      surveyId,
      familyId,
      newFamilyId,
      newHouseholdId,
      familyInformation,
      serviceAvailed,
      householdInformation,
      serviceAvailedValues
    });

    ////////////////////////////////////////////////

    // UPDATE HOUSEHOLD DATA

    await updateHouseholdData(connection, {
      householdId,
      newHouseholdId,
      householdInformation,
      waterInformation,
      houseImages
    });

    // HOUSE IMAGES

    ////////////////////////////////////////////////

    

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