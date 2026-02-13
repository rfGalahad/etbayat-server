import pool from '../../config/db.js';
import { 
  generateHouseholdId, 
  generateSurveyId 
} from '../../controllers/surveyControllers/generateId.js';
import {
  safeTrim
} from '../../utils/stringUtils.js';
import { 
  parseIncome 
} from "../../utils/numberUtils.js";
import { 
  prepareResidentValues,
  prepareServiceAvailedValues,
  prepareSurveyDataValues 
} from '../../utils/transformers/surveyDataTransformers.js';
import { 
  cleanupCloudinaryUploads, 
  uploadMultipleToCloudinary,
  uploadToCloudinary
} from '../../utils/cloudinaryUtils.js';
import {
  base64ToBuffer
} from '../../utils/fileUtils.js';


const ID_PREFIXES = {
  SURVEY: 'SID-',
  HOUSEHOLD: 'HID-',
  FAMILY: 'FID-'
}

const CLOUDINARY_PATHS = {
  HOUSE_IMAGES: 'surveys/house-images',
  RESPONDENT_PHOTOS: 'surveys/respondent-photos',
  RESPONDENT_SIGNATURES: 'surveys/respondent-signatures'
};


export const createSurveyService = async (formData, userId, files) => {

  const connection = await pool.getConnection();

  let houseImages = [];
  let respondentSignature = null;
  let respondentPhoto = null;

  const {
    familyInformation,
    familyProfile,
    householdInformation,
    waterInformation,
    farmlots,
    communityIssues,
    serviceAvailed,
    acknowledgement
  } = formData

  try {

    await connection.beginTransaction();

    ////////////////////////////////////////////////////////////////////////////////

    // GENERATE IDs

    const surveyId = `${ID_PREFIXES.SURVEY}${await generateSurveyId(connection)}`;
    const tempHouseholdId = await generateHouseholdId(connection);
    let householdId = `${ID_PREFIXES.HOUSEHOLD}${tempHouseholdId}`;
    let familyId;

    ////////////////////////////////////////////////////////////////////////////////

    // CHECK IF MULTIPLE FAMILY IN ONE HOUSEHOLD

    if (householdInformation.multipleFamily) {
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

      if (existingPerson.length > 0) {
        householdId = existingPerson[0].household_id;

        const [latestFamily] = await connection.query(`
          SELECT family_id
          FROM family_information
          WHERE household_id = ?
          ORDER BY family_id DESC
          LIMIT 1
        `, [householdId]);

        familyId = getNextFamilyId(
          latestFamily[0]?.family_id,
          householdId.replace(ID_PREFIXES.HOUSEHOLD, '')
        );
      } else {
        householdId = `${ID_PREFIXES.HOUSEHOLD}${tempHouseholdId}`;
        familyId = `${ID_PREFIXES.FAMILY}${tempHouseholdId}-A`;
      }
    } else {
      householdId = `${ID_PREFIXES.HOUSEHOLD}${tempHouseholdId}`;
      familyId = `${ID_PREFIXES.FAMILY}${tempHouseholdId}-A`;
    }

    ////////////////////////////////////////////////////////////////////////////////

    // UPLOAD IMAGES TO CLOUDINARY

    if (files?.houseImages) {
      houseImages = await uploadMultipleToCloudinary(
        files.houseImages, 
        CLOUDINARY_PATHS.HOUSE_IMAGES
      );
    }

    if (files?.respondentPhoto?.[0]) {
      respondentPhoto = await uploadToCloudinary(
        files.respondentPhoto[0].buffer,
        CLOUDINARY_PATHS.RESPONDENT_PHOTOS,
        files.respondentPhoto[0].originalname
      );
    }

    if (acknowledgement?.respondentSignature) {
      const signatureBuffer = base64ToBuffer(acknowledgement.respondentSignature);
      respondentSignature = await uploadToCloudinary(
        signatureBuffer,
        CLOUDINARY_PATHS.RESPONDENT_SIGNATURES,
        'respondent-signature'
      );
    }

    ////////////////////////////////////////////////////////////////////////////////

    // SURVEY DATA

    const surveyData = prepareSurveyDataValues(surveyId, formData);

    await insertSurveyData(connection, { 
      surveyId, 
      userId, 
      familyInformation,
      respondentPhoto,
      respondentSignature,
      surveyData,
      farmlots,
      communityIssues,
      waterInformation
    });
    
    ////////////////////////////////////////////////////////////////////////////////

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
      imageValues
    });

    ////////////////////////////////////////////////////////////////////////////////

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

    ////////////////////////////////////////////////////////////////////////////////

    // POPULATION DATA

    const residentValues = prepareResidentValues(familyId, familyProfile);
    await insertPopulationData(connection, residentValues);

    ////////////////////////////////////////////////////////////////////////////////

    await connection.commit();

    return surveyId;
  } catch (error) {
    await connection.rollback();

    console.error('❌ Survey creation failed:', {
      error: error.message,
      surveyId,
      userId,
      timestamp: new Date().toISOString()
    });

    await cleanupCloudinaryUploads({
      houseImages,
      respondentPhoto,
      respondentSignature
    });

    throw new SurveyCreationError('Failed to create survey', {
      cause: error,
      surveyId,
      userId
    });
  } finally {
    connection.release();
  }
}


//////////////////////////////////////////////////////////////////


export const insertSurveyData = async (connection, data) => {

  const surveyId = data.surveyId;
  const userId = data.userId;
  const familyInformation = data.familyInformation;
  const farmlots = data.farmlots;
  const communityIssues = data.communityIssues;
  const waterInformation = data.waterInformation;

  const foodValues = data.surveyData.foodValues;
  const educationValues = data.surveyData.educationValues;
  const familyValues = data.surveyData.familyValues;
  const monthlyValues = data.surveyData.monthlyValues;
  const livestockValues = data.surveyData.livestockValues;
  const cropsPlantedValues = data.surveyData.cropsPlantedValues;
  const fruitBearingTreeValues = data.surveyData.fruitBearingTreeValues;
  const familyResourcesValues = data.surveyData.familyResourcesValues;
  const appliancesOwnValues = data.surveyData.appliancesOwnValues;
  const amenitiesValues = data.surveyData.amenitiesValues;

  // SURVEY
  await connection.query(
    `INSERT INTO surveys (
      survey_id,
      user_id,
      respondent_first_name,
      respondent_middle_name,
      respondent_last_name,
      respondent_suffix,
      respondent_photo_url,
      respondent_photo_id,
      respondent_signature_url,
      respondent_signature_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      surveyId,
      userId,
      safeTrim(familyInformation.respondentFirstName),
      safeTrim(familyInformation.respondentMiddleName),
      safeTrim(familyInformation.respondentLastName),
      safeTrim(familyInformation.respondentSuffix),
      data.respondentPhoto?.url || null,
      data.respondentPhoto?.publicId || null,
      data.respondentSignature?.url || null,
      data.respondentSignature?.publicId || null
    ]
  );

  // FOOD EXPENSES
  if (foodValues.length > 0) {
    await connection.query(
      `INSERT INTO food_expenses (
        survey_id, 
        expense_type, 
        amount
      ) VALUES ?`,
      [foodValues]
    );
  }

  // EDUCATION EXPENSES
  if (educationValues.length > 0) {
    await connection.query(
      `INSERT INTO education_expenses (
        survey_id, 
        expense_type, 
        amount
      ) VALUES ?`,
      [educationValues]
    );
  }

  // FAMILY EXPENSES
  if (familyValues.length > 0) {
    await connection.query(
      `INSERT INTO family_expenses (
        survey_id, 
        expense_type, 
        amount
      ) VALUES ?`,
      [familyValues]
    );
  }
  
  // MONTHLY EXPENSES
  if (monthlyValues.length > 0) {
    await connection.query(
      `INSERT INTO monthly_expenses (
        survey_id, 
        expense_type, 
        amount
      ) VALUES ?`,
      [monthlyValues]
    );
  }
  
  // LIVESTOCK
  if (livestockValues.length > 0) {
    await connection.query(
      `INSERT INTO livestock (
        survey_id, 
        animal_type, 
        own,
        dispersal
      ) VALUES ?`,
      [livestockValues]
    );
  }
  
  // FARM LOTS
  if (farmlots) {
    await connection.query(
      `INSERT INTO farm_lots (
        survey_id, 
        ownership_type, 
        cultivation,
        pastureland,
        forestland
      ) VALUES (?, ?, ?, ?, ?)`,
      [
        surveyId,
        farmlots.ownershipType,
        farmlots.cultivation || null,
        farmlots.pastureland || null,
        farmlots.forestland || null
      ]
    );
  }
  
  // CROPS PLANTED
  if (cropsPlantedValues.length > 0) {
    await connection.query(
      `INSERT INTO crops_planted (
        survey_id, 
        crops,
        planted_area
      ) VALUES ?`,
      [cropsPlantedValues]
    );
  }
  
  // FRUIT BEARING TREES
  if (fruitBearingTreeValues.length > 0) {
    await connection.query(
      `INSERT INTO fruit_bearing_trees (
        survey_id, 
        tree,
        count
      ) VALUES ?`,
      [fruitBearingTreeValues]
    );
  }

  // FAMILY RESOURCES
  if (familyResourcesValues.length > 0) {
    await connection.query(
      `INSERT INTO family_resources (
        survey_id,
        resources,
        amount
      ) VALUES ?`,
      [familyResourcesValues]
    );
  }
  
  // APPLIANCES OWN
  if (appliancesOwnValues.length > 0) {
    await connection.query(
      `INSERT INTO appliances_own (
        survey_id,
        appliance,
        count
      ) VALUES ?`,
      [appliancesOwnValues]
    );
  }
  
  // AMENITIES
  if (amenitiesValues.length > 0) {
    await connection.query(
      `INSERT INTO amenities (
        survey_id,
        amenity,
        count
      ) VALUES ?`,
      [amenitiesValues]
    );
  } 
  
  // COMMUNITY ISSUES
  if (communityIssues) {
    await connection.query(
      `INSERT INTO community_issues (
        survey_id, 
        community_issue
      ) VALUES (?, ?)`,
      [
        surveyId,
        communityIssues.communityIssue
      ]
    );
  }

  // WATER INFORMATION
  await connection.query(
    `INSERT INTO water_information (
      survey_id,
      water_access,
      potable_water,
      water_sources
    ) VALUES (?, ?, ?, ?)
    `,
    [
      surveyId,
      waterInformation.waterAccess === 'YES',
      waterInformation.potableWater === 'YES',
      waterInformation.waterSources?.join(', ') || null
    ]
  );  
};

export const insertHouseholdData = async (connection, data) => {

  const householdId = data.householdId;
  const householdInformation = data.householdInformation;
  const imageValues = data.imageValues;

  // HOUSEHOLDS
  await connection.query(`
    INSERT IGNORE INTO households (
      household_id,
      house_structure,
      house_condition,
      latitude,
      longitude,
      street,
      barangay,
      sitio_yawran,
      municipality,
      multiple_family,
      family_head_first_name,
      family_head_middle_name,
      family_head_last_name,
      family_head_suffix
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    householdId,
    householdInformation?.houseStructure ?? null,
    householdInformation?.houseCondition ?? null,
    householdInformation?.position?.[0] ?? null,
    householdInformation?.position?.[1] ?? null,
    safeTrim(householdInformation?.houseStreet),
    householdInformation?.barangay ?? null,
    householdInformation?.sitioYawran ?? null,
    householdInformation?.municipality ?? null,
    householdInformation?.multipleFamily ?? null,
    safeTrim(householdInformation?.familyHeadFirstName),
    safeTrim(householdInformation?.familyHeadMiddleName),
    safeTrim(householdInformation?.familyHeadLastName),
    safeTrim(householdInformation?.familyHeadSuffix)
  ]);

  // HOUSE IMAGES
  if (imageValues.length > 0) {
    await connection.query(
      `INSERT INTO house_images (
        household_id,
        house_image_url, 
        house_image_public_id,
        house_image_title
      ) VALUES ?`,
      [imageValues]
    );
  }
};

export const insertFamilyData = async (connection, data) => {
  
  const familyId = data.familyId;
  const householdId = data.householdId;
  const surveyId = data.surveyId;
  const familyInformation = data.familyInformation;
  const serviceAvailedValues = data.serviceAvailedValues;

  await connection.query(
    `INSERT INTO family_information (
      family_id,
      household_id,
      survey_id,
      monthly_income,
      irregular_income,
      family_income
    ) VALUES (?, ?, ?, ?, ?, ?)`, 
    [
      familyId,
      householdId,
      surveyId,
      parseIncome(familyInformation?.monthlyIncome) ?? 0,
      parseIncome(familyInformation?.irregularIncome) ?? 0,
      parseIncome(familyInformation?.familyIncome) ?? 0,
    ]
  );

  // SERVICE / ASSISTANCE
  if (serviceAvailedValues.length > 0) {
    await connection.query(
      `INSERT INTO service_availed (
        family_id,
        date_service_availed,
        ngo_name,
        other_ngo_name,
        service_availed,
        other_service_availed, 
        male_served,
        female_served,
        how_service_help
      ) VALUES ?`, 
      [serviceAvailedValues]
    );
  }
};

export const insertPopulationData = async (connection, residentValues) => {

  const populationValues = residentValues.populationValues;
  const socialClassificationValues = residentValues.socialClassificationValues;
  const professionalValues = residentValues.professionalValues;
  const contactValues = residentValues.contactValues;
  const healthValues = residentValues.healthValues;
  const governmentIdValues = residentValues.governmentIdValues;
  const affiliationValues = residentValues.affiliationValues;
  const nonIvatanValues = residentValues.nonIvatanValues;

  // POPULATION
  await connection.query(
    `INSERT INTO population (
      resident_id,
      family_id,
      first_name,
      middle_name,
      last_name,
      suffix,
      sex,
      birthdate,
      verified_birthdate,
      specify_id,
      civil_status,
      religion,
      relation_to_family_head,
      other_relationship,
      birthplace
    ) VALUES ?`,
    [populationValues]
  );

  // SOCIAL CLASSIFICATION
  if (socialClassificationValues?.length > 0) {
    await connection.query(
      `INSERT INTO social_classification (
        resident_id,
        classification_code,
        classification_name
      ) VALUES ?`,
      [socialClassificationValues]
    );
  }
  
  // PROFESSIONAL INFORMATION
  await connection.query(
    `INSERT INTO professional_information (
      resident_id,
      educational_attainment,
      skills,
      occupation,
      employment_type,
      monthly_income,
      receiving_pension,
      pension_type,
      other_pension_type,
      pension_income
    ) VALUES ?`,
    [professionalValues]
  );

  // CONTACT INFORMATION
  if (contactValues.length > 0) {
    await connection.query(
      `INSERT INTO contact_information (
        resident_id,
        contact_number
      ) VALUES ?`,
      [contactValues]
    );
  }

  // HEALTH INFORMATION
  if (healthValues.length > 0) {
    await connection.query(
      `INSERT INTO health_information (
        resident_id,
        health_status
      ) VALUES ?`,
      [healthValues]
    );
  }
  
  // GOVERNMENT IDS
  if (governmentIdValues.length > 0) {
    await connection.query(
      `INSERT INTO government_ids (
        resident_id,
        philhealth
      ) VALUES ?`,
      [governmentIdValues]
    );
  }

  // AFFILIATION
  if (affiliationValues?.length > 0) {
    await connection.query(
      `INSERT INTO affiliation (
        resident_id,
        date_become_officer,
        date_become_member,
        organization_name
      ) VALUES ?`,
      [affiliationValues]
    );
  }

  // NON-IVATAN
  if (nonIvatanValues?.length > 0) {
    await connection.query(
      `INSERT INTO non_ivatan (
        resident_id,
        settlement_details,
        ethnicity,
        place_of_origin,
        transient,
        house_owner,
        date_registered
      ) VALUES ?`,
      [nonIvatanValues]
    );
  }
};