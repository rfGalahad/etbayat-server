import { parseIncome } from "../../utils/helpers.js";

export const insertSurveyData = async (connection, data) => {

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
      respondent,
      respondent_photo_url,
      respondent_photo_id,
      respondent_signature_url,
      respondent_signature_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      data.surveyId,
      data.userId,
      data.respondent,
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
  if (data.farmlots) {
    await connection.query(
      `INSERT INTO farm_lots (
        survey_id, 
        ownership_type, 
        cultivation,
        pastureland,
        forestland
      ) VALUES (?, ?, ?, ?, ?)`,
      [
        data.surveyId,
        data.farmlots.ownershipType,
        data.farmlots.cultivation || null,
        data.farmlots.pastureland || null,
        data.farmlots.forestland || null
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
  if (data.commmunityIssues) {
    await connection.query(
      `INSERT INTO community_issues (
        survey_id, 
        community_issue
      ) VALUES (?, ?)`,
      [
        data.surveyId,
        data.commmunityIssues.communityIssue
      ]
    );
  }
};

export const insertHouseholdData = async (connection, data) => {
  // HOUSEHOLDS
  await connection.query(`
    INSERT IGNORE INTO households (
      household_id,
      survey_id,
      house_structure,
      house_condition,
      latitude,
      longitude,
      street,
      barangay,
      municipality,
      multiple_family
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    data.householdId,
    data.surveyId,
    data.householdInformation?.houseStructure ?? null,
    data.householdInformation?.houseCondition ?? null,
    data.householdInformation?.position?.[0] ?? null,
    data.householdInformation?.position?.[1] ?? null,
    data.householdInformation?.houseStreet ?? null,
    data.householdInformation?.barangay ?? null,
    data.householdInformation?.municipality ?? null,
    data.householdInformation?.multipleFamily ?? null
  ]);

  // HOUSE IMAGES
  if (data.imageValues.length > 0) {
    await connection.query(
      `INSERT INTO house_images (
        household_id,
        house_image_url, 
        house_image_public_id,
        house_image_title
      ) VALUES ?`,
      [data.imageValues]
    );
  }

  // WATER INFORMATION
  await connection.query(
    `INSERT INTO water_information (
      household_id,
      water_access,
      potable_water,
      water_sources
    ) VALUES (?, ?, ?, ?)
    `,
    [
      data.householdId,
      data.waterInformation.waterAccess === 'YES',
      data.waterInformation.potableWater === 'YES',
      data.waterInformation.waterSources?.join(', ') || null
    ]
  );  
};

export const insertFamilyData = async (connection, data) => {
  // FAMILY INFORMATION
  await connection.query(
    `INSERT INTO family_information (
      family_id,
      household_id,
      monthly_income,
      irregular_income,
      family_income
    ) VALUES (?, ?, ?, ?, ?)`, 
    [
      data.familyId,
      data.householdId,
      parseIncome(data.familyInformation?.monthlyIncome) ?? 0,
      parseIncome(data.familyInformation?.irregularIncome) ?? 0,
      parseIncome(data.familyInformation?.familyIncome) ?? 0,
    ]
  );

  // SERVICE / ASSISTANCE
  if (data.serviceAvailedValues.length > 0) {
    await connection.query(
      `INSERT INTO service_availed (
        family_id,
        date_service_availed,
        ngo_name,
        service_availed, 
        male_served,
        female_served,
        how_service_help
      ) VALUES ?`, 
      [data.serviceAvailedValues]
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
      civil_status,
      religion,
      relation_to_family_head,
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
      monthly_income
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




