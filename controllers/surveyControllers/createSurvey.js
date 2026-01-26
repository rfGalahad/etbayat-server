import pool from '../../config/db.js';
import { 
  generateHouseholdId, 
  generateSurveyId 
} from './generateId.js';
import { 
  deleteMultipleFromCloudinary,
  uploadMultipleToCloudinary, 
  uploadToCloudinary 
} from '../../utils/cloudinaryUpload.js';
import {
  prepareServiceAvailedValues,
  prepareSurveyDataValues,
  prepareResidentValues
} from '../../utils/surveyDataTransformers.js';
import { 
  insertFamilyData,
  insertHouseholdData, 
  insertPopulationData,
  insertSurveyData
} from '../../services/surveyService/createSurveyService.js';
import { 
  base64ToBuffer, 
  getNextFamilyId 
} from '../../utils/helpers.js';


export const createSurvey = async (req, res) => {

  const connection = await pool.getConnection();

  let houseImages = [];
  let respondentSignature = null;
  let respondentPhoto = null;
 
  try {
    await connection.beginTransaction();

    const { userId } = req.user;
    const formData = JSON.parse(req.body.formData);
    const {
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

    const tempSurveyId = await generateSurveyId(connection);
    const surveyId = `SID-${tempSurveyId}`;

    const tempHouseholdId = await generateHouseholdId(connection);
    let householdId = `HID-${tempHouseholdId}`;
    let familyId;

    // CHECK IF MULTIPLE FAMILY IN ONE HOUSEHOLD
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

        householdId = existingPerson[0].household_id;

        // Get latest family_id under the same household
        const [latestFamily] = await connection.query(`
          SELECT family_id
          FROM family_information
          WHERE household_id = ?
          ORDER BY family_id DESC
          LIMIT 1
        `, [householdId]);

        console.log('Latest family in household:', latestFamily[0]);

        familyId = getNextFamilyId(
          latestFamily[0]?.family_id,
          householdId.replace('HID-', '')
        );

        console.log('Generated new familyId:', familyId);

      } else {
        console.log('❌ Family head not found. Creating new household and family IDs.');
        householdId = `HID-${tempHouseholdId}`;
        familyId = `FID-${tempHouseholdId}-A`;
        console.log({ householdId, familyId });
      }

    } else {
      // Single family household
      console.log('🏠 Single family household. Creating new household and family IDs.');
      householdId = `HID-${tempHouseholdId}`;
      familyId = `FID-${tempHouseholdId}-A`;
      console.log({ householdId, familyId });
    }

    ////////////////////////////////////////////////

    // UPLOAD IMAGES TO CLOUDINARY    
    
    if (req.files?.houseImages) {
      console.log('Uploading house images to Cloudinary...');
      houseImages = await uploadMultipleToCloudinary(
        req.files.houseImages, 
        'surveys/house-images'
      );
      console.log('House images uploaded:', houseImages);
    }

    if (req.files?.respondentPhoto?.[0]) {
      console.log('Uploading respondent photo to Cloudinary...');
      respondentPhoto = await uploadToCloudinary(
        req.files.respondentPhoto[0].buffer,
        'surveys/respondent-photos',
        req.files.respondentPhoto[0].originalname
      );
      console.log('Respondent photo uploaded:', respondentPhoto);
    }

    if (acknowledgement?.respondentSignature) {
      console.log('Uploading respondent signature to Cloudinary...');
      const signatureBuffer = base64ToBuffer(acknowledgement.respondentSignature);
      respondentSignature = await uploadToCloudinary(
        signatureBuffer,
        'surveys/respondent-signatures',
        'respondent-signature'
      );
      console.log('Respondent signature uploaded:', respondentSignature.url);
    }
    
    ////////////////////////////////////////////////

    // SURVEY DATA
    
    const surveyData = prepareSurveyDataValues(surveyId, {
      expenses,
      livestock,
      cropsPlanted,
      fruitBearingTrees,
      familyResources,
      appliancesOwn,
      amenities
    })

    await insertSurveyData(connection, { 
      surveyId, 
      userId, 
      respondent: familyInformation.respondent,
      respondentPhoto,
      respondentSignature,
      surveyData,
      farmlots,
      communityIssues
    });

    ////////////////////////////////////////////////

    // HOUSEHOLD DATA

    const imageValues = houseImages.map((img, index) => [ 
      householdId, 
      img.url, 
      img.publicId, 
      householdInformation.houseImageTitles[index] 
    ]);

    await insertHouseholdData(connection, { 
      householdId, 
      surveyId, 
      householdInformation,
      imageValues,
      waterInformation
    });

    ////////////////////////////////////////////////

    // FAMILY DATA

    const serviceAvailedValues = prepareServiceAvailedValues(
      familyId, 
      serviceAvailed
    );

    await insertFamilyData(connection, {
      familyId,
      householdId,
      surveyId,
      familyInformation,
      serviceAvailedValues
    })

    ////////////////////////////////////////////////

    // POPULATION DATA - RESIDENT DATA

    const residentValues = prepareResidentValues(familyId, familyProfile);
    await insertPopulationData(connection, residentValues);

    ////////////////////////////////////////////////

    await connection.commit();

    res.status(201).json({ 
      success: true,
      message: 'Survey created successfully',
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

    console.error('Error creating post:', error);

    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ 
        success: false,
        message: 'Survey ID already exists' 
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