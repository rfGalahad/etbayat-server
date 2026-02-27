import pool from '../../config/db.js';
import { 
  formatDateForMySQL, 
  formatMonthYearForMySQL
} from "../../utils/dateUtils.js";
import {
  parseIncome
} from '../../utils/numberUtils.js'
import { 
  deleteRemovedResidents, 
  findExistingFamilyHead, 
  generateNextFamilyId, 
  generateResidentId, 
  getNextResidentSequence, 
  migrateResidentsToNewFamily, 
  parseFamilyId, 
  upsertPopulation 
} from "../../helpers/surveyHelpers/surveyHelpers.js";
import { 
  prepareServiceAvailedValues ,
  prepareSurveyDataValues 
} from "../../utils/transformers/surveyDataTransformers.js";
import { 
  deleteMultipleFromCloudinary,
  cleanupCloudinaryUploads, 
  uploadMultipleToCloudinary, 
  uploadToCloudinary 
} from '../../utils/cloudinaryUtils.js';
import { 
  CLASSIFICATIONS 
} from '../../constants/surveyConstants.js';


const CLOUDINARY_PATHS = {
  HOUSE_IMAGES: 'surveys/house-images',
  RESPONDENT_PHOTOS: 'surveys/respondent-photos',
  RESPONDENT_SIGNATURES: 'surveys/respondent-signatures'
};

export const updateSurveyService = async (formData, userId, files) => {

  const connection = await pool.getConnection();

  let houseImages = [];
  let respondentSignature = null;
  let respondentPhoto = null;
  
  const {
    surveyId,
    householdId,
    familyId,
    familyInformation,
    familyProfile,
    householdInformation,
    waterInformation,
    farmlots,
    communityIssues,
    serviceAvailed,
    acknowledgement
  } = formData;

  try {

    ////////////////////////////////////////////////////////////////////////////////

    // CHECK IF MULTIPLE FAMILY IN ONE HOUSEHOLD
    
    let newHouseholdId = null;
    let newFamilyId = null;
    let shouldMigrateToExistingHousehold = false;

    const multipleFamily = householdInformation.multipleFamily;
    const alreadyMultipleFamily = householdInformation.alreadyMultipleFamily;

    if (multipleFamily && !alreadyMultipleFamily) {
      const familyHeadResult = await findExistingFamilyHead(connection, {
        firstName: householdInformation.familyHeadFirstName?.trim(),
        middleName: householdInformation.familyHeadMiddleName?.trim() || null,
        lastName: householdInformation.familyHeadLastName?.trim(),
        suffix: householdInformation.familyHeadSuffix?.trim() || null
      });

      if (familyHeadResult) {
        shouldMigrateToExistingHousehold = true;
        newHouseholdId = familyHeadResult.household_id;
        newFamilyId = await generateNextFamilyId(connection, newHouseholdId);
      }
    }

    ////////////////////////////////////////////////////////////////////////////////

    // DELETE IMAGES FROM CLOUDINARY AND DATABASE

    const hasPublicIdToDelete = householdInformation.publicIdToDelete?.length > 0;
    const hasImageIdToDelete = householdInformation.imageIdToDelete?.length > 0;

    if (hasPublicIdToDelete && hasImageIdToDelete) {
      await deleteMultipleFromCloudinary(
        householdInformation.publicIdToDelete
      );

      await connection.query(`
        DELETE FROM house_images
        WHERE house_image_id IN (?)`, 
        [householdInformation.imageIdToDelete]
      );
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
      if (acknowledgement?.respondentPhotoId) {
        await cloudinary.uploader.destroy(acknowledgement.respondentPhotoId);
      }
      
      respondentPhoto = await uploadToCloudinary(
        files.respondentPhoto[0].buffer,
        CLOUDINARY_PATHS.RESPONDENT_PHOTOS,
        files.respondentPhoto[0].originalname
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
        CLOUDINARY_PATHS.RESPONDENT_SIGNATURES,
        'respondent-signature'
      );
    }

    ////////////////////////////////////////////////////////////////////////////////

    // UPDATE SURVEY DATA

    const surveyData = prepareSurveyDataValues(surveyId, formData);

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

    ////////////////////////////////////////////////////////////////////////////////

    // MIGRATE OR UPDATE POPULATION DATA

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

    ////////////////////////////////////////////////////////////////////////////////

    // MIGRATE OR UPDATE FAMILY INFORMATION

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

    ////////////////////////////////////////////////////////////////////////////////

    // HOUSEHOLD DATA

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

    ////////////////////////////////////////////////////////////////////////////////

    await connection.commit();
    return surveyId;
    
  } catch (error) {

    await connection.rollback();

    console.error('❌ Updating survey failed:', {
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

    throw error
  } finally {
    connection.release();
  }
}

// =================================================================================
// UPDATE SURVEY DATA 

const upsertExpensesData = async (connection, tableName, expenseValues) => {
  if (!expenseValues || expenseValues.length === 0) return;

  const sql = `
    INSERT INTO ${tableName} (survey_id, expense_type, amount)
    VALUES ?
    ON DUPLICATE KEY UPDATE amount = VALUES(amount)
  `;

  return await connection.query(sql, [expenseValues]);
};

const bulkUpsert = async (
  connection,
  table,
  insertColumns,
  updateColumns,
  values
) => {
  if (!values || values.length === 0) return;

  const updateClause = updateColumns
    .map(col => `${col} = VALUES(${col})`)
    .join(', ');

  const sql = `
    INSERT INTO ${table} (${insertColumns.join(', ')})
    VALUES ?
    ON DUPLICATE KEY UPDATE ${updateClause}
  `;

  return connection.query(sql, [values]);
};

export const updateSurveyData = async (connection, data) => {

  const surveyData = data.surveyData;
  
  // UPDATE SURVEY
  await connection.query(`
    UPDATE surveys 
    SET respondent_first_name = ?,
        respondent_middle_name = ?,
        respondent_last_name = ?,
        respondent_suffix = ?
    WHERE survey_id = ?`,
    [
      (data.familyInformation.respondentFirstName || "").trim(),
      (data.familyInformation.respondentMiddleName || "").trim(),
      (data.familyInformation.respondentLastName || "").trim(),
      (data.familyInformation.respondentSuffix || "").trim(),
      data.surveyId
    ]
  );

  // UPDATE ACKNOWLEDGEMENT
  if (data.respondentPhoto || data.respondentSignature) {
    await connection.query(`
      UPDATE surveys 
      SET respondent_photo_url = ?,
          respondent_photo_id = ?,
          respondent_signature_url = ?,
          respondent_signature_id = ?
      WHERE survey_id = ?`,
      [
        data.respondentPhoto?.url || null,
        data.respondentPhoto?.publicId || null,
        data.respondentSignature?.url || null,
        data.respondentSignature?.publicId || null,
        data.surveyId
      ]
    );
  } 

  // UPSERT FOOD EXPENSES
  await upsertExpensesData(
    connection, 
    'food_expenses', 
    surveyData.foodValues
  );

  // UPSERT EDUCATION EXPENSES
  await upsertExpensesData(
    connection, 
    'education_expenses', 
    surveyData.educationValues
  );

  // UPSERT FAMILY EXPENSES
  await upsertExpensesData(
    connection, 
    'family_expenses', 
    surveyData.familyValues
  );

  // UPSERT MONTHLY EXPENSES
  await upsertExpensesData(
    connection, 
    'monthly_expenses', 
    surveyData.monthlyValues
  );

  // UPSERT LIVESTOCK
  await bulkUpsert(
    connection,
    'livestock',
    ['survey_id', 'animal_type', 'own', 'dispersal'],
    ['own', 'dispersal'],
    surveyData.livestockValues
  );

  // UPDATE FARM LOTS 
  if (data.farmlots.farmlotsId) {
    await connection.query(
      `UPDATE farm_lots
      SET ownership_type = ?, 
          cultivation = ?,
          pastureland = ?,
          forestland = ?
      WHERE farm_lots_id = ?`,
      [
        data.farmlots.ownershipType || null,
        data.farmlots.cultivation || null,
        data.farmlots.pastureland || null,
        data.farmlots.forestland || null,
        data.farmlots.farmlotsId
      ]
    );
  } else {
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

  // UPSERT CROPS PLANTED
  await bulkUpsert(
    connection,
    'crops_planted',
    ['survey_id', 'crops', 'planted_area'],
    ['planted_area'],
    surveyData.cropsPlantedValues
  );

  // UPSERT FRUIT BEARING TREES
  await bulkUpsert(
    connection,
    'fruit_bearing_trees',
    ['survey_id', 'tree', 'count'],
    ['count'],
    surveyData.fruitBearingTreeValues
  );

  // UPSERT FAMILY RESOURCES
  await bulkUpsert(
    connection,
    'family_resources',
    ['survey_id', 'resources', 'amount'],
    ['amount'],
    surveyData.familyResourcesValues
  );

  // UPSERT APPLIANCES OWN 
  await bulkUpsert(
    connection,
    'appliances_own',
    ['survey_id', 'appliance', 'count'],
    ['count'],
    surveyData.appliancesOwnValues
  );

  // UPSERT AMENITIES
  await bulkUpsert(
    connection,
    'amenities',
    ['survey_id', 'amenity', 'count'],
    ['count'],
    surveyData.amenitiesValues
  );

  // UPDATE COMMUNITY ISSUES
  if (data.communityIssues?.communityIssuesId) {
    await connection.query(`
      UPDATE community_issues
      SET community_issue = ?
      WHERE community_issues_id = ?`,
      [
        data.communityIssues.communityIssue,
        data.communityIssues.communityIssuesId
      ]
    );
  } else {
    await connection.query(
      `INSERT INTO community_issues (
        survey_id, 
        community_issue
      ) VALUES (?, ?)`,
      [
        data.surveyId,
        data.communityIssues.communityIssue
      ]
    );
  }

  // UPDATE WATER INFORMATION
  await connection.query(`
    UPDATE water_information
    SET water_access = ?,
        potable_water = ?,
        water_sources = ?
    WHERE water_information_id = ?
  `, [
    data.waterInformation.waterAccess === 'YES',
    data.waterInformation.potableWater === 'YES',
    data.waterInformation.waterSources?.join(', ') || null,
    data.waterInformation.waterInformationId
  ]);

  await connection.query(
    `UPDATE surveys SET updated_at = CURRENT_TIMESTAMP WHERE survey_id = ?`,
    [data.surveyId]
  );
};

// =================================================================================
// UPDATE HOUSEHOLD DATA 

export const updateHouseholdData = async (connection, data) => {
  
  const { 
    householdId, 
    householdInformation, 
    imageValues
  } = data;

  await connection.query(`
    UPDATE households
    SET house_structure = ?, 
        house_condition = ?,
        latitude = ?,
        longitude = ?,
        street = ?,
        barangay = ?,
        sitio_yawran = ?,
        municipality = ?,
        multiple_family = ?
    WHERE household_id = ?
  `, [
    householdInformation?.houseStructure ?? null,
    householdInformation?.houseCondition ?? null,
    householdInformation?.position?.[0] ?? null,
    householdInformation?.position?.[1] ?? null,
    householdInformation?.houseStreet?.trim() ?? null,
    householdInformation?.barangay ?? null,
    householdInformation?.sitioYawran ?? null,
    householdInformation?.municipality ?? null,
    householdInformation?.multipleFamily ?? null,
    householdId
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
}

export const upsertHouseholdData = async (connection, data) => {

  const { 
    householdId, 
    householdInformation, 
    houseImages 
  } = data;

  // Upsert household
  await connection.query(`
    INSERT INTO households (
      household_id,
      house_structure,
      house_condition,
      latitude,
      longitude,
      street,
      barangay,
      sitio_yawran,
      municipality,
      multiple_family
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      house_structure = VALUES(house_structure),
      house_condition = VALUES(house_condition),
      latitude = VALUES(latitude),
      longitude = VALUES(longitude),
      street = VALUES(street),
      barangay = VALUES(barangay),
      municipality = VALUES(municipality),
      multiple_family = VALUES(multiple_family)
  `, [
    householdId,
    householdInformation?.houseStructure ?? null,
    householdInformation?.houseCondition ?? null,
    householdInformation?.position?.[0] ?? null,
    householdInformation?.position?.[1] ?? null,
    householdInformation?.houseStreet?.trim() ?? null,
    householdInformation?.barangay ?? null,
    householdInformation?.sitioYawran ?? null,
    householdInformation?.municipality ?? null,
    householdInformation?.multipleFamily ?? null
  ]);

  // Insert house images if provided
  if (houseImages?.length > 0) {
    const imageValues = houseImages.map((img, index) => [
      householdId,
      img.url,
      img.publicId,
      householdInformation.houseImageTitles?.[index] ?? null
    ]);

    await connection.query(`
      INSERT INTO house_images (
        household_id,
        house_image_url,
        house_image_public_id,
        house_image_title
      ) VALUES ?
    `, [imageValues]);
  }
}

export const cleanupOldHousehold = async (connection, householdId) => {
  const [familyCount] = await connection.query(`
    SELECT COUNT(*) AS count
    FROM family_information
    WHERE household_id = ?
  `, [householdId]);

  if (familyCount[0].count === 0) {
    await connection.query(`
      DELETE FROM households
      WHERE household_id = ?
    `, [householdId]);
  } 
}

// =================================================================================
// UPDATE FAMILY DATA 

const syncServiceAvailed = async (
  connection, 
  familyId, 
  serviceAvailed
) => {
  const existingIds = serviceAvailed
    .filter(s => s.serviceAvailedId)
    .map(s => s.serviceAvailedId);

  // Delete removed records
  if (existingIds.length > 0) {
    await connection.query(`
      DELETE FROM service_availed
      WHERE family_id = ?
        AND service_availed_id NOT IN (?)
    `, [familyId, existingIds]);
  } else {
    await connection.query(`
      DELETE FROM service_availed
      WHERE family_id = ?
    `, [familyId]);
  }

  // Update existing records
  for (const service of serviceAvailed.filter(s => s.serviceAvailedId)) {
    await connection.query(`
      UPDATE service_availed
      SET date_service_availed = ?,
          ngo_name = ?,
          other_ngo_name = ?,
          service_availed = ?,
          other_service_availed = ?,
          male_served = ?,
          female_served = ?,
          how_service_help = ?
      WHERE service_availed_id = ?
        AND family_id = ?
    `, [
      formatMonthYearForMySQL(service.dateServiceAvailed),
      service.ngoName,
      service.otherNgoName || null,
      service.serviceAvailed,
      service.otherServiceAvailed || null, 
      service.maleServed,
      service.femaleServed,
      service.howServiceHelp,
      service.serviceAvailedId,
      familyId
    ]);
  }

  // Insert new records
  const newRecords = serviceAvailed.filter(s => !s.serviceAvailedId);
  if (newRecords.length > 0) {
    const insertValues = newRecords.map(s => [
      familyId,
      formatMonthYearForMySQL(s.dateServiceAvailed),
      s.ngoName,
      s.otherNgoName,
      s.serviceAvailed,
      s.otherServiceAvailed,
      s.maleServed,
      s.femaleServed,
      s.howServiceHelp
    ]);

    await connection.query(`
      INSERT INTO service_availed (
        family_id,
        date_service_availed,
        ngo_name,
        other_ngo_name,
        service_availed,
        other_service_availed,
        male_served,
        female_served,
        how_service_help
      ) VALUES ?
    `, [insertValues]);
  }
}

export const updateFamilyInformation = async (connection, data) => {

  const { 
    familyId, 
    familyInformation, 
    serviceAvailed 
  } = data;

  // FAMILY INFORMATION
  await connection.query(`
    UPDATE family_information 
    SET family_class = ?,
        monthly_income = ?,
        irregular_income = ?,
        family_income = ?
    WHERE family_id = ?
  `, [
    familyInformation?.familyClass ?? null,
    parseIncome(familyInformation?.monthlyIncome) ?? 0,
    parseIncome(familyInformation?.irregularIncome) ?? 0,
    parseIncome(familyInformation?.familyIncome) ?? 0,
    familyId
  ]);

  // SERVICE AVAILED
  await syncServiceAvailed(connection, familyId, serviceAvailed);
}

export const migrateFamilyToNewHousehold = async (connection, data) => {

  const {
    oldFamilyId,
    newFamilyId,
    newHouseholdId,
    surveyId,
    familyInformation,
    serviceAvailed
  } = data;

  // Create new family_information record
  await connection.query(`
    INSERT INTO family_information (
      family_id,
      household_id,
      survey_id,
      family_class,
      monthly_income,
      irregular_income,
      family_income
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `, [
    newFamilyId,
    newHouseholdId,
    surveyId,
    familyInformation?.familyClass ?? null,
    parseIncome(familyInformation?.monthlyIncome) ?? 0,
    parseIncome(familyInformation?.irregularIncome) ?? 0,
    parseIncome(familyInformation?.familyIncome) ?? 0
  ]);

  // Insert service availed records for new family
  if (serviceAvailed?.length > 0) {
    const serviceValues = prepareServiceAvailedValues(
      newFamilyId, 
      serviceAvailed
    );
    if (serviceValues.length > 0) {
      await connection.query(`
        INSERT INTO service_availed (
          family_id,
          date_service_availed,
          ngo_name,
          service_availed,
          male_served,
          female_served,
          how_service_help
        ) VALUES ?
      `, [serviceValues]);
    }
  }

  // Delete old family_information (CASCADE will handle service_availed)
  await connection.query(`
    DELETE FROM family_information
    WHERE family_id = ?
  `, [oldFamilyId]);
}

// =================================================================================
// UPDATE POPULATION / RESIDENT

export const syncResidentTable = async (
  connection,
  tableName,
  familyProfile,
  {
    primaryKey = 'resident_id',
    checkHasData,
    mapToValues,
    columns,
    updateColumns
  }
) => {
  await connection.beginTransaction();

  try {
    const withData = [];
    const withoutData = [];

    for (const r of familyProfile) {
      if (checkHasData(r)) {
        withData.push(r);
      } else {
        withoutData.push(r.residentId);
      }
    }

    // DELETE cleared rows
    if (withoutData.length > 0) {
      await connection.query(
        `DELETE FROM ${tableName} WHERE ${primaryKey} IN (?)`,
        [withoutData]
      );
    }

    // UPSERT data
    if (withData.length > 0) {
      const values = withData.map(mapToValues);
      const updateClause = updateColumns
        .map(col => `${col} = VALUES(${col})`)
        .join(', ');

      await connection.query(
        `INSERT INTO ${tableName} (${columns.join(', ')})
         VALUES ?
         ON DUPLICATE KEY UPDATE ${updateClause}`,
        [values]
      );
    }

    await connection.commit();
  } catch (err) {
    await connection.rollback();
    throw err;
  }
};

export const syncPopulation = async (
  connection,
  familyId,
  familyProfile,
  newFamilyId = null
) => {
  try {
    const targetFamilyId = newFamilyId || familyId;
    const { residentBaseId } = parseFamilyId(targetFamilyId);

    if (newFamilyId && newFamilyId !== familyId) {
      familyProfile = await migrateResidentsToNewFamily(
        connection,
        familyId,
        newFamilyId,
        familyProfile,
        residentBaseId
      );
    }

    const existingResidentIds = familyProfile
      .filter(r => r.residentId)
      .map(r => r.residentId);

    await deleteRemovedResidents(
      connection,
      targetFamilyId,
      existingResidentIds
    );

    let nextSeq = await getNextResidentSequence(
      connection,
      targetFamilyId
    );

    familyProfile = familyProfile.map(r =>
      r.residentId
        ? r
        : { ...r, residentId: generateResidentId(residentBaseId, nextSeq++) }
    );

    await upsertPopulation(
      connection,
      targetFamilyId,
      familyProfile
    );

    return familyProfile;

  } catch (err) {
    console.error('❌ ERROR IN SYNC POPULATION:', err);
    throw err;
  }
};

export const syncSocialClassifications = async (
  connection,
  familyProfile,
  CLASSIFICATIONS
) => {
  try {
    for (const member of familyProfile) {
      const residentId = member.residentId;
      if (!residentId) continue;

      // 1️⃣ Build current classification list
      const classifications = [];

      if (member.ofw) classifications.push(CLASSIFICATIONS.ofw);
      if (member.outOfTown) classifications.push(CLASSIFICATIONS.outOfTown);
      if (member.pwd) classifications.push(CLASSIFICATIONS.pwd);
      if (member.soloParent) classifications.push(CLASSIFICATIONS.soloParent);
      if (member.nonIvatan) classifications.push(CLASSIFICATIONS.nonIvatan);

      if (member.youthCategory && CLASSIFICATIONS[member.youthCategory]) {
        classifications.push(CLASSIFICATIONS[member.youthCategory]);
      }

      const codes = classifications.map(c => c.code);

      // 2️⃣ DELETE removed classifications
      if (codes.length > 0) {
        await connection.query(
          `
          DELETE FROM social_classification
          WHERE resident_id = ?
            AND classification_code NOT IN (?)
          `,
          [residentId, codes]
        );
      } else {
        await connection.query(
          `
          DELETE FROM social_classification
          WHERE resident_id = ?
          `,
          [residentId]
        );
      }

      // 3️⃣ UPSERT current classifications
      if (classifications.length > 0) {
        const values = classifications.map(c => [
          residentId,
          c.code,
          c.name
        ]);

        await connection.query(
          `
          INSERT INTO social_classification (
            resident_id,
            classification_code,
            classification_name
          )
          VALUES ?
          ON DUPLICATE KEY UPDATE
            classification_name = VALUES(classification_name)
          `,
          [values]
        );
      }
    }
  } catch (err) {
    throw err;
  }
};

export const syncProfessionalInformation = async (
  connection, 
  familyProfile
) => {
  return syncResidentTable(connection, 'professional_information', familyProfile, {
    checkHasData: (r) => 
      r.educationalAttainment || 
      r.skills || 
      r.occupation || 
      r.company || 
      r.employmentStatus || 
      r.monthlyIncome,
    mapToValues: (r) => [
      r.residentId,
      r.educationalAttainment || null,
      r.skills || null,
      r.occupation || null,
      r.otherOccupation || null,
      r.company || null,
      r.employmentStatus || null,
      r.employmentCategory || null,
      r.employmentType || null,
      parseIncome(r.monthlyIncome),
      parseIncome(r.annualIncome),
      r.receivingPension,
      r.pensionType,
      r.otherPensionType || null,
      parseIncome(r.pensionIncome)
    ],
    columns: [
      'resident_id', 'educational_attainment', 'skills', 'occupation', 'other_occupation',
      'company', 'employment_status', 'employment_category', 'employment_type',
      'monthly_income', 'annual_income', 'receiving_pension', 'pension_type',
      'other_pension_type', 'pension_income'
    ],
    updateColumns: [
      'educational_attainment', 'skills', 'occupation', 'other_occupation', 'company', 
      'employment_status', 'employment_category', 'employment_type',
      'monthly_income', 'annual_income', 'receiving_pension', 'pension_type',
      'other_pension_type', 'pension_income'
    ]
  });
};

export const syncContactInformation = async (
  connection, 
  familyProfile
) => {
  return syncResidentTable(connection, 'contact_information', familyProfile, {
    checkHasData: (r) => r.contactNumber,
    mapToValues: (r) => [r.residentId, r.contactNumber || null],
    columns: ['resident_id', 'contact_number'],
    updateColumns: ['contact_number']
  });
};

export const syncHealthInformation = async (
  connection, 
  familyProfile
) => {
  return syncResidentTable(connection, 'health_information', familyProfile, {
    checkHasData: (r) => r.healthStatus,
    mapToValues: (r) => [r.residentId, r.healthStatus || null],
    columns: ['resident_id', 'health_status'],
    updateColumns: ['health_status']
  });
};

export const syncGovernmentId = async (
  connection,
  familyProfile
) => {
  return syncResidentTable(connection, 'government_ids', familyProfile, {
    primaryKey: 'resident_id',

    checkHasData: (r) => {
      return !!r.philhealthNumber;
    },

    mapToValues: (r) => [
      r.residentId,
      r.philhealthNumber || null
    ],

    columns: [
      'resident_id',
      'philhealth'
    ],

    updateColumns: [
      'philhealth'
    ]
  });
};

export const syncAffiliatedMember = async (
  connection,
  familyProfile
) => {
  return syncResidentTable(connection, 'affiliation', familyProfile, {
    primaryKey: 'resident_id',

    checkHasData: (r) => {
      return (
        r.dateBecomeOfficer ||
        r.dateBecomeMember ||
        r.organizationName
      );
    },

    mapToValues: (r) => [
      r.residentId,
      formatDateForMySQL(r.dateBecomeOfficer) || null,
      formatDateForMySQL(r.dateBecomeMember) || null,
      r.organizationName || null
    ],

    columns: [
      'resident_id',
      'date_become_officer',
      'date_become_member',
      'organization_name'
    ],

    updateColumns: [
      'date_become_officer',
      'date_become_member',
      'organization_name'
    ]
  });
};

export const syncNonIvatanMember = async (
  connection,
  familyProfile
) => {
  return syncResidentTable(connection, 'non_ivatan', familyProfile, {
    primaryKey: 'resident_id',

    checkHasData: (r) => {
      return (
        r.settlementDetails ||
        r.ethnicity ||
        r.placeOfOrigin ||
        r.transient ||
        r.houseOwner ||
        r.dateRegistered
      );
    },

    mapToValues: (r) => [
      r.residentId,
      r.settlementDetails || null,
      r.ethnicity || null,
      r.placeOfOrigin || null,
      r.transient || null,
      r.houseOwner || null,
      formatDateForMySQL(r.dateRegistered) || null
    ],

    columns: [
      'resident_id',
      'settlement_details',
      'ethnicity',
      'place_of_origin',
      'transient',
      'house_owner',
      'date_registered'
    ],

    updateColumns: [
      'settlement_details',
      'ethnicity',
      'place_of_origin',
      'transient',
      'house_owner',
      'date_registered'
    ]
  });
};