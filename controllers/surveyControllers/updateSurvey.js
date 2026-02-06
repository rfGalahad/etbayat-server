import pool from '../../config/db.js';
import cloudinary from '../../config/cloudinary.js';
import { 
  base64ToBuffer, 
  formatDateForMySQL, 
  parseIncome 
} from '../../utils/helpers.js';
import { 
  cleanupOldHousehold,
  migrateFamilyToNewHousehold,
  syncAffiliatedMember, 
  syncContactInformation, 
  syncGovernmentId, 
  syncHealthInformation, 
  syncNonIvatanMember, 
  syncPopulation, 
  syncProfessionalInformation, 
  syncSocialClassifications,  
  updateFamilyInformation,  
  updateHouseholdData,  
  updateSurveyData,
  upsertHouseholdData
} from '../../services/surveyService/updateSurveyService.js';
import { 
  deleteMultipleFromCloudinary, 
  uploadMultipleToCloudinary, 
  uploadToCloudinary 
} from '../../utils/cloudinaryUpload.js';
import { prepareSurveyDataValues } from '../../utils/surveyDataTransformers.js';
import { CLASSIFICATIONS } from '../../constants/surveyConstants.js';
import { apiError } from '../../utils/apiError.js';

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
    } = formData;

    // ================================================
    // STEP 1: DETERMINE NEW HOUSEHOLD & FAMILY IDs
    // ================================================

    let newHouseholdId = null;
    let newFamilyId = null;
    let shouldMigrateToExistingHousehold = false;

    if (householdInformation.multipleFamily && !householdInformation.alreadyMultipleFamily) {
      console.log('🏠 MULTIPLE FAMILY UPDATE DETECTED');

      const familyHeadResult = await findExistingFamilyHead(connection, {
        firstName: householdInformation.familyHeadFirstName?.trim(),
        middleName: householdInformation.familyHeadMiddleName?.trim() || null,
        lastName: householdInformation.familyHeadLastName?.trim(),
        suffix: householdInformation.familyHeadSuffix?.trim() || null
      });

      if (familyHeadResult) {
        shouldMigrateToExistingHousehold = true;
        newHouseholdId = familyHeadResult.household_id;
        
        // Generate new family ID under the existing household
        newFamilyId = await generateNextFamilyId(connection, newHouseholdId);

        console.log('✅ MIGRATION TO EXISTING HOUSEHOLD:', {
          oldHouseholdId: householdId,
          oldFamilyId: familyId,
          newHouseholdId,
          newFamilyId
        });
      } else {
        console.log('❌ FAMILY HEAD NOT FOUND - keeping original IDs');
      }
    }

    // ================================================
    // STEP 2.1: DELETE IMAGES FROM  CLOUDINARY AND DATABASE
    // ================================================

    if (
      householdInformation.publicIdToDelete?.length > 0 &&
      householdInformation.imageIdToDelete?.length > 0
    ) {
      // 1. DELETE IMAGES FROM CLOUDINARY
      await deleteMultipleFromCloudinary(
        householdInformation.publicIdToDelete
      );

      // 2. DELETE IMAGES FROM DATABASE
      const deleteImagesQuery = `
        DELETE FROM house_images
        WHERE house_image_id IN (?)
      `;

      await connection.query(deleteImagesQuery, [
        householdInformation.imageIdToDelete
      ]);
    }

    // ================================================
    // STEP 2.2: UPLOAD IMAGES TO CLOUDINARY
    // ================================================

    if (req.files?.houseImages) {
      console.log('UPLOADING HOUSE IMAGES...')
      houseImages = await uploadMultipleToCloudinary(
        req.files.houseImages, 
        'surveys/house-images'
      );
    }

    if (req.files?.respondentPhoto?.[0]) {
      if (acknowledgement?.respondentPhotoId) {
        await cloudinary.uploader.destroy(acknowledgement.respondentPhotoId);
      }
      
      respondentPhoto = await uploadToCloudinary(
        req.files.respondentPhoto[0].buffer,
        'surveys/respondent-photos',
        req.files.respondentPhoto[0].originalname
      );
    }

    const isNewSignature = acknowledgement.respondentSignature?.startsWith('data:image/');
    
    if (isNewSignature) {
      if (acknowledgement?.respondentSignaturePublicId) {
        await cloudinary.uploader.destroy(acknowledgement.respondentSignaturePublicId);
      }

      const signatureBuffer = base64ToBuffer(acknowledgement.respondentSignature);
      respondentSignature = await uploadToCloudinary(
        signatureBuffer,
        'surveys/respondent-signatures',
        'respondent-signature'
      );
    }

    // ================================================
    // STEP 3: UPDATE SURVEY DATA
    // ================================================

    const surveyData = prepareSurveyDataValues(surveyId, {
      expenses,
      livestock,
      cropsPlanted,
      fruitBearingTrees,
      familyResources,
      appliancesOwn,
      amenities
    });

    await updateSurveyData(connection, {
      surveyId,
      familyInformation,
      respondentPhoto,
      respondentSignature,
      surveyData,
      farmlots,
      communityIssues,
      waterInformation
    });

    // ================================================
    // STEP 4: MIGRATE OR UPDATE POPULATION DATA
    // ================================================

    const updatedFamilyProfile = await syncPopulation(
      connection,
      familyId,
      familyProfile,
      newFamilyId
    );

    await syncSocialClassifications(connection, updatedFamilyProfile, CLASSIFICATIONS);
    await syncProfessionalInformation(connection, updatedFamilyProfile);
    await syncContactInformation(connection, updatedFamilyProfile);
    await syncHealthInformation(connection, updatedFamilyProfile);
    await syncGovernmentId(connection, updatedFamilyProfile);
    await syncAffiliatedMember(connection, updatedFamilyProfile);
    await syncNonIvatanMember(connection, updatedFamilyProfile);

    // ================================================
    // STEP 5: MIGRATE OR UPDATE FAMILY INFORMATION
    // ================================================

    if (shouldMigrateToExistingHousehold) {
      await migrateFamilyToNewHousehold(connection, {
        oldFamilyId: familyId,
        newFamilyId,
        newHouseholdId,
        surveyId,
        familyInformation,
        serviceAvailed
      });
    } else {
      await updateFamilyInformation(connection, {
        familyId,
        familyInformation,
        serviceAvailed
      });
    }

    // ================================================
    // STEP 6: HANDLE HOUSEHOLD DATA
    // ================================================

    if (shouldMigrateToExistingHousehold) {
      // Ensure target household exists and is up-to-date
      await upsertHouseholdData(connection, {
        householdId: newHouseholdId,
        householdInformation,
        houseImages
      });

      // Clean up old household if no longer in use
      await cleanupOldHousehold(connection, householdId);
    } else {
      // Regular household update
      const imageValues = houseImages.map((img, index) => [ 
        householdId, 
        img.url, 
        img.publicId, 
        householdInformation.houseImageTitles[index] 
      ]);

      await updateHouseholdData(connection, {
        householdId,
        householdInformation,
        imageValues
      });
    }

    /////////////////////////////////////////////////////////////

    await connection.commit();

    return res.status(200).json({ 
      success: true,
      message: 'Survey updated successfully',
      surveyId,
      ...(newFamilyId && { 
        migrated: true,
        newFamilyId,
        newHouseholdId 
      })
    });

  } catch (error) {
    await connection.rollback();

    // CLEANUP UPLOADED IMAGES
    await cleanupCloudinaryUploads({
      houseImages,
      respondentPhoto,
      respondentSignature
    });

    console.error('Error updating survey:', error);

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

    // 🖼 Cloudinary upload/delete errors
    if (error.name === 'CloudinaryError') {
      return res.status(500).json(
        apiError({
          code: 'IMAGE_UPLOAD_FAILED',
          message: error.message,
          userMessage:
            'Some images could not be uploaded. Please try again.'
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

    // ❌ Fallback
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

// ================================================
// HELPER FUNCTIONS
// ================================================

async function findExistingFamilyHead(connection, { firstName, middleName, lastName, suffix }) {
  console.log('🔍 SEARCHING FOR FAMILY HEAD:', { firstName, middleName, lastName, suffix });

  const [results] = await connection.query(`
    SELECT p.family_id, f.household_id
    FROM population p
    JOIN family_information f ON f.family_id = p.family_id
    WHERE p.first_name = ?
      AND (p.middle_name <=> ?)
      AND p.last_name = ?
      AND (p.suffix <=> ?)
      AND p.relation_to_family_head = 'Family Head'
    LIMIT 1
  `, [firstName, middleName, lastName, suffix]);

  return results[0] || null;
}

async function generateNextFamilyId(connection, householdId) {
  // Get latest family under this household
  const [latestFamily] = await connection.query(`
    SELECT family_id
    FROM family_information
    WHERE household_id = ?
    ORDER BY family_id DESC
    LIMIT 1
  `, [householdId]);

  // Extract household number from household_id (HID-0126-0001 → 0001)
  const householdParts = householdId.split('-');
  const barangayCode = householdParts[1]; // 0126
  const householdNumber = householdParts[2]; // 0001

  let nextLetter = 'A';

  if (latestFamily[0]?.family_id) {
    // Extract letter from latest family_id (FID-0126-0001-B → B)
    const familyParts = latestFamily[0].family_id.split('-');
    const currentLetter = familyParts[3] || 'A';
    
    // Get next letter (A→B, B→C, etc.)
    nextLetter = String.fromCharCode(currentLetter.charCodeAt(0) + 1);
  }

  const newFamilyId = `FID-${barangayCode}-${householdNumber}-${nextLetter}`;
  
  console.log('📝 GENERATED FAMILY ID:', {
    householdId,
    latestFamilyId: latestFamily[0]?.family_id || 'none',
    newFamilyId
  });

  return newFamilyId;
}

async function cleanupCloudinaryUploads({ houseImages, respondentPhoto, respondentSignature }) {
  try {
    const publicIdsToDelete = [];

    if (houseImages?.length > 0) {
      publicIdsToDelete.push(...houseImages.map(img => img.publicId));
    }
    if (respondentPhoto?.publicId) {
      publicIdsToDelete.push(respondentPhoto.publicId);
    }
    if (respondentSignature?.publicId) {
      publicIdsToDelete.push(respondentSignature.publicId);
    }

    if (publicIdsToDelete.length > 0) {
      await deleteMultipleFromCloudinary(publicIdsToDelete);
      console.log(`🧹 Cleaned up ${publicIdsToDelete.length} images from Cloudinary`);
    }
  } catch (error) {
    console.error('Error cleaning up Cloudinary uploads:', error);
  }
}