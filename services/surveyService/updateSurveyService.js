import { formatDateForMySQL, parseIncome } from "../../utils/helpers.js";
import { prepareServiceAvailedValues } from "../../utils/surveyDataTransformers.js";

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

  console.log('FAMILY', data.familyInformation)
  
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
        data.farmlots.ownershipType,
        data.farmlots.cultivation,
        data.farmlots.pastureland,
        data.farmlots.forestland,
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
  
};


///////////////////////////////////////////////////////////////////


// UPDATE HOUSEHOLD DATA

export const updateHouseholdData = async (connection, data) => {
  
  const { 
    householdId, 
    householdInformation, 
    waterInformation,
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
    waterInformation, 
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
      municipality,
      multiple_family
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
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
    
    console.log('🗑️ OLD HOUSEHOLD DELETED:', householdId);
  } else {
    console.log('⛔ OLD HOUSEHOLD STILL IN USE');
  }
}


///////////////////////////////////////////////////////////////////

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
          service_availed = ?,
          male_served = ?,
          female_served = ?,
          how_service_help = ?
      WHERE service_availed_id = ?
        AND family_id = ?
    `, [
      formatDateForMySQL(service.dateServiceAvailed),
      service.ngoName,
      service.serviceAvailed,
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
      formatDateForMySQL(s.dateServiceAvailed),
      s.ngoName,
      s.serviceAvailed,
      s.maleServed,
      s.femaleServed,
      s.howServiceHelp
    ]);

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

  console.log('✅ FAMILY MIGRATED:', { from: oldFamilyId, to: newFamilyId });
}


///////////////////////////////////////////////////////////////////

// UPDATE POPULATION / RESIDENT

export const syncPopulation = async (
  connection,
  familyId,
  familyProfile,
  newFamilyId = null
) => {
  try {
    const targetFamilyId = newFamilyId || familyId;
    
    // Extract base for resident IDs from family ID
    // FID-0126-0001-A → RID-0126-0001-A
    const familyParts = targetFamilyId.split('-');
    const barangayCode = familyParts[1]; // 0126
    const householdNumber = familyParts[2]; // 0001
    const familyLetter = familyParts[3]; // A
    const residentBaseId = `RID-${barangayCode}-${householdNumber}-${familyLetter}`;

    console.log('👥 SYNC POPULATION:', {
      oldFamilyId: familyId,
      newFamilyId: targetFamilyId,
      residentBaseId
    });

    /** 1️⃣ Collect resident IDs sent by client */
    const existingResidentIds = familyProfile
      .filter(r => r.residentId)
      .map(r => r.residentId);

    /** 🔹 IF newFamilyId exists, migrate residents to new family with new IDs */
    if (newFamilyId && newFamilyId !== familyId && existingResidentIds.length > 0) {
      console.log('🔄 MIGRATING RESIDENTS TO NEW FAMILY');

      // Temporarily disable foreign key checks for ID updates
      await connection.query('SET FOREIGN_KEY_CHECKS = 0');

      // Update all residents and their related records
      for (let i = 0; i < existingResidentIds.length; i++) {
        const oldResidentId = existingResidentIds[i];
        
        // Extract sequence number from old resident ID
        // RID-0126-0003-A-1 → 1
        const oldParts = oldResidentId.split('-');
        const sequence = oldParts[oldParts.length - 1];
        
        // Generate new resident ID with correct format
        // RID-0126-0001-B-1 (includes household number and family letter)
        const newResidentId = `${residentBaseId}-${sequence}`;

        console.log(`  🔄 Migrating: ${oldResidentId} → ${newResidentId}`);

        // Update all related tables in dependency order
        await connection.query(
          `UPDATE social_classification SET resident_id = ? WHERE resident_id = ?`,
          [newResidentId, oldResidentId]
        );

        await connection.query(
          `UPDATE professional_information SET resident_id = ? WHERE resident_id = ?`,
          [newResidentId, oldResidentId]
        );

        await connection.query(
          `UPDATE contact_information SET resident_id = ? WHERE resident_id = ?`,
          [newResidentId, oldResidentId]
        );

        await connection.query(
          `UPDATE health_information SET resident_id = ? WHERE resident_id = ?`,
          [newResidentId, oldResidentId]
        );

        await connection.query(
          `UPDATE government_ids SET resident_id = ? WHERE resident_id = ?`,
          [newResidentId, oldResidentId]
        );

        await connection.query(
          `UPDATE affiliation SET resident_id = ? WHERE resident_id = ?`,
          [newResidentId, oldResidentId]
        );

        await connection.query(
          `UPDATE non_ivatan SET resident_id = ? WHERE resident_id = ?`,
          [newResidentId, oldResidentId]
        );

        // Finally update population table
        await connection.query(
          `UPDATE population 
           SET family_id = ?, resident_id = ?
           WHERE resident_id = ? AND family_id = ?`,
          [targetFamilyId, newResidentId, oldResidentId, familyId]
        );

        // Update the ID in the array for later use
        existingResidentIds[i] = newResidentId;
      }

      // Re-enable foreign key checks
      await connection.query('SET FOREIGN_KEY_CHECKS = 1');

      // Update familyProfile with new resident IDs
      familyProfile = familyProfile.map(r => {
        if (r.residentId) {
          const oldParts = r.residentId.split('-');
          const sequence = oldParts[oldParts.length - 1];
          return {
            ...r,
            residentId: `${residentBaseId}-${sequence}`
          };
        }
        return r;
      });

      console.log('✅ RESIDENT MIGRATION COMPLETE');
    }

    /** 2️⃣ DELETE removed residents */
    if (existingResidentIds.length > 0) {
      await connection.query(
        `DELETE FROM population
         WHERE family_id = ?
           AND resident_id NOT IN (?)`,
        [targetFamilyId, existingResidentIds]
      );
    } else {
      await connection.query(
        `DELETE FROM population WHERE family_id = ?`,
        [targetFamilyId]
      );
    }

    /** 3️⃣ Determine next resident number for new members */
    const [rows] = await connection.query(
      `SELECT MAX(
          CAST(SUBSTRING_INDEX(resident_id, '-', -1) AS UNSIGNED)
        ) AS maxNum
       FROM population
       WHERE family_id = ?`,
      [targetFamilyId]
    );

    let nextNum = (rows[0]?.maxNum || 0) + 1;

    /** 4️⃣ Generate resident IDs for new members */
    const updatedFamilyProfile = familyProfile.map(r => {
      let residentId = r.residentId;

      if (!residentId) {
        residentId = `${residentBaseId}-${nextNum}`;
        console.log(`  ✨ New resident: ${residentId}`);
        nextNum++;
      }

      return {
        ...r,
        residentId
      };
    });

    /** 5️⃣ Prepare values for upsert */
    const values = updatedFamilyProfile.map(r => [
      r.residentId,
      targetFamilyId,
      r.firstName,
      r.middleName,
      r.lastName,
      r.suffix || null,
      r.sex,
      formatDateForMySQL(r.birthdate),
      r.civilStatus,
      r.religion,
      r.relationToFamilyHead,
      r.birthplace
    ]);

    /** 6️⃣ UPSERT population records */
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
      )
      VALUES ?
      ON DUPLICATE KEY UPDATE
        first_name = VALUES(first_name),
        middle_name = VALUES(middle_name),
        last_name = VALUES(last_name),
        suffix = VALUES(suffix),
        sex = VALUES(sex),
        birthdate = VALUES(birthdate),
        civil_status = VALUES(civil_status),
        religion = VALUES(religion),
        relation_to_family_head = VALUES(relation_to_family_head),
        birthplace = VALUES(birthplace)
      `,
      [values]
    );

    console.log(`✅ SYNCED ${updatedFamilyProfile.length} RESIDENTS`);
    return updatedFamilyProfile;

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

      if (
        member.youthCategory &&
        CLASSIFICATIONS[member.youthCategory]
      ) {
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
  await connection.beginTransaction();

  try {
    /** 1️⃣ Split payload */
    const withProfessional = [];
    const withoutProfessional = [];

    for (const r of familyProfile) {
      const hasProfessionalData =
        r.educationalAttainment ||
        r.skills ||
        r.occupation ||
        r.company ||
        r.employmentStatus ||
        r.employmentCategory ||
        r.employmentType ||
        r.monthlyIncome ||
        r.annualIncome;

      if (hasProfessionalData) {
        withProfessional.push(r);
      } else {
        withoutProfessional.push(r.residentId);
      }
    }

    /** 2️⃣ DELETE professional rows that were cleared */
    if (withoutProfessional.length > 0) {
      await connection.query(
        `
        DELETE FROM professional_information
        WHERE resident_id IN (?)
        `,
        [withoutProfessional]
      );
    }

    /** 3️⃣ UPSERT professional info */
    if (withProfessional.length > 0) {
      const values = withProfessional.map(r => [
        r.residentId,
        r.educationalAttainment || null,
        r.skills || null,
        r.occupation || null,
        r.company || null,
        r.employmentStatus || null,
        r.employmentCategory || null,
        r.employmentType || null,
        parseIncome(r.monthlyIncome),
        parseIncome(r.annualIncome)
      ]);

      await connection.query(
        `
        INSERT INTO professional_information (
          resident_id,
          educational_attainment,
          skills,
          occupation,
          company,
          employment_status,
          employment_category,
          employment_type,
          monthly_income,
          annual_income
        )
        VALUES ?
        ON DUPLICATE KEY UPDATE
          educational_attainment = VALUES(educational_attainment),
          skills = VALUES(skills),
          occupation = VALUES(occupation),
          company = VALUES(company),
          employment_status = VALUES(employment_status),
          employment_category = VALUES(employment_category),
          employment_type = VALUES(employment_type),
          monthly_income = VALUES(monthly_income),
          annual_income = VALUES(annual_income)
        `,
        [values]
      );
    }

    await connection.commit();
  } catch (err) {
    await connection.rollback();
    throw err;
  }
};

export const syncContactInformation = async (
  connection,
  familyProfile
) => {
  await connection.beginTransaction();

  try {
    /** 1️⃣ Split payload */
    const withContact = [];
    const withoutContact = [];

    for (const r of familyProfile) {
      const hasContactData = r.contactNumber;

      if (hasContactData) {
        withContact.push(r);
      } else {
        withoutContact.push(r.residentId);
      }
    }

    /** 2️⃣ DELETE contact rows that were cleared */
    if (withoutContact.length > 0) {
      await connection.query(
        `
        DELETE FROM contact_information
        WHERE resident_id IN (?)
        `,
        [withoutContact]
      );
    }

    /** 3️⃣ UPSERT contact info */
    if (withContact.length > 0) {
      const values = withContact.map(r => [
        r.residentId,
        r.contactNumber || null
      ]);

      await connection.query(
        `
        INSERT INTO contact_information (
          resident_id,
          contact_number
        )
        VALUES ?
        ON DUPLICATE KEY UPDATE
          contact_number = VALUES(contact_number)
        `,
        [values]
      );
    }

    await connection.commit();
  } catch (err) {
    await connection.rollback();
    throw err;
  }
};

export const syncHealthInformation = async (
  connection,
  familyProfile
) => {
  await connection.beginTransaction();

  try {
    /** 1️⃣ Split payload */
    const withHealth = [];
    const withoutHealth = [];

    for (const r of familyProfile) {
      const hasHealthData = r.healthStatus;

      if (hasHealthData) {
        withHealth.push(r);
      } else {
        withoutHealth.push(r.residentId);
      }
    }

    /** 2️⃣ DELETE health rows that were cleared */
    if (withoutHealth.length > 0) {
      await connection.query(
        `
        DELETE FROM health_information
        WHERE resident_id IN (?)
        `,
        [withoutHealth]
      );
    }

    /** 3️⃣ UPSERT health info */
    if (withHealth.length > 0) {
      const values = withHealth.map(r => [
        r.residentId,
        r.healthStatus || null
      ]);

      await connection.query(
        `
        INSERT INTO health_information (
          resident_id,
          health_status
        )
        VALUES ?
        ON DUPLICATE KEY UPDATE
          health_status = VALUES(health_status)
        `,
        [values]
      );
    }

    await connection.commit();
  } catch (err) {
    await connection.rollback();
    throw err;
  }
};

export const syncGovernmentId = async (
  connection,
  familyProfile
) => {
  await connection.beginTransaction();

  try {
    /** 1️⃣ Split payload */
    const withGovernmentId = [];
    const withoutGovernmentId = [];

    for (const r of familyProfile) {
      const hasGovernmentData = r.philhealthNumber;

      if (hasGovernmentData) {
        withGovernmentId.push(r);
      } else {
        withoutGovernmentId.push(r.residentId);
      }
    }

    /** 2️⃣ DELETE health rows that were cleared */
    if (withoutGovernmentId.length > 0) {
      await connection.query(
        `
        DELETE FROM government_ids
        WHERE resident_id IN (?)
        `,
        [withoutGovernmentId]
      );
    }

    /** 3️⃣ UPSERT health info */
    if (withGovernmentId.length > 0) {
      const values = withGovernmentId.map(r => [
        r.residentId,
        r.philhealthNumber || null
      ]);

      await connection.query(
        `
        INSERT INTO government_ids (
          resident_id,
          philhealth
        )
        VALUES ?
        ON DUPLICATE KEY UPDATE
          philhealth = VALUES(philhealth)
        `,
        [values]
      );
    }

    await connection.commit();
  } catch (err) {
    await connection.rollback();
    throw err;
  }
};

export const syncAffiliatedMember = async (
  connection,
  familyProfile
) => {
  await connection.beginTransaction();

  try {
    /** 1️⃣ Split payload */
    const withAffiliation = [];
    const withoutAffiliation = [];

    for (const r of familyProfile) {
      const hasAffiliationData =
        r.dateBecomeOfficer ||
        r.dateBecomeMember ||
        r.organizationName;

      if (hasAffiliationData) {
        withAffiliation.push(r);
      } else {
        withoutAffiliation.push(r.residentId);
      }
    }

    /** 2️⃣ DELETE professional rows that were cleared */
    if (withoutAffiliation.length > 0) {
      await connection.query(
        `
        DELETE FROM affiliation
        WHERE resident_id IN (?)
        `,
        [withoutAffiliation]
      );
    }

    /** 3️⃣ UPSERT professional info */
    if (withAffiliation.length > 0) {
      const values = withAffiliation.map(r => [
        r.residentId,
        formatDateForMySQL(r.dateBecomeOfficer) || null,
        formatDateForMySQL(r.dateBecomeMember) || null,
        r.organizationName || null
      ]);

      await connection.query(
        `
        INSERT INTO affiliation (
          resident_id,
          date_become_officer,
          date_become_member,
          organization_name
        )
        VALUES ?
        ON DUPLICATE KEY UPDATE
          date_become_officer = VALUES(date_become_officer),
          date_become_member = VALUES(date_become_member),
          organization_name = VALUES(organization_name)
        `,
        [values]
      );
    }

    await connection.commit();
  } catch (err) {
    await connection.rollback();
    throw err;
  }
};

export const syncNonIvatanMember = async (
  connection,
  familyProfile
) => {
  await connection.beginTransaction();

  try {
    /** 1️⃣ Split payload */
    const withNonIvatan = [];
    const withoutNonIvatan = [];

    for (const r of familyProfile) {
      const hasNonIvatanData =
        r.settlementDetails ||
        r.ethnicity ||
        r.placeOfOrigin ||
        r.transient ||
        r.houseOwner ||
        r.dateRegistered;

      if (hasNonIvatanData) {
        withNonIvatan.push(r);
      } else {
        withoutNonIvatan.push(r.residentId);
      }
    }

    /** 2️⃣ DELETE non-ivatan rows that were cleared */
    if (withoutNonIvatan.length > 0) {
      await connection.query(
        `
        DELETE FROM non_ivatan
        WHERE resident_id IN (?)
        `,
        [withoutNonIvatan]
      );
    }

    /** 3️⃣ UPSERT non-ivatan info */
    if (withNonIvatan.length > 0) {
      const values = withNonIvatan.map(r => [
        r.residentId,
        r.settlementDetails || null,
        r.ethnicity || null,
        r.placeOfOrigin || null,
        r.transient || null,
        r.houseOwner || null,
        formatDateForMySQL(r.dateRegistered) || null
      ]);

      await connection.query(
        `
        INSERT INTO non_ivatan (
          resident_id,
          settlement_details,
          ethnicity,
          place_of_origin,
          transient,
          house_owner,
          date_registered
        )
        VALUES ?
        ON DUPLICATE KEY UPDATE
          settlement_details = VALUES(settlement_details),
          ethnicity = VALUES(ethnicity),
          place_of_origin = VALUES(place_of_origin),
          transient = VALUES(transient),
          house_owner = VALUES(house_owner),
          date_registered = VALUES(date_registered)
        `,
        [values]
      );
    }

    await connection.commit();
  } catch (err) {
    await connection.rollback();
    throw err;
  }
};
