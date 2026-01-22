import pool from '../../config/db.js';
import { 
  expensesValueReducer, 
  keyValueReducer, 
  nestedReducer 
} from '../../utils/reducers.js';
import { transformSurveyToFormData } from '../../utils/transformSurveyToFormData.js';

export const getSurveyById = async (req, res) => {
  
  const connection = await pool.getConnection();

  try {
    const surveyId = req.params.surveyId;

    const [householdRows] = await connection.query(`
      SELECT 
          household_id AS householdId
      FROM households
      WHERE survey_id = ?;`,
      [surveyId]
    );

    const householdId = householdRows[0].householdId;

    const [familyRows] = await connection.query(
      `SELECT 
        s.respondent,
        f.family_id as familyId,
        f.irregular_income AS irregularIncome,
        f.family_class AS familyClass,
        f.monthly_income AS monthlyIncome, 
        f.family_income AS familyIncome
      FROM family_information f
      JOIN households h ON h.household_id = f.household_id
      JOIN surveys s ON s.survey_id = h.survey_id
      WHERE f.household_id = ?`,
      [householdId]
    );

    const familyInformation = familyRows[0] || {};
    const familyId = familyRows[0].familyId;

    /* =======================
       Parallel Queries
    ======================== */
    const [
      [familyProfileRows],
      [classificationRows],
      [expensesRows],
      [householdInformationRows],
      [houseImages],
      [waterInformationRows],
      [livestockRows],
      [farmlotsRows],
      [cropsPlantedRows],
      [fruitBearingTreesRows],
      [familyResourcesRows],
      [appliancesOwnRows],
      [amenitiesRows],
      [communityIssuesRows],
      [serviceAvailed],
      [acknowledgementRows]
    ] = await Promise.all([

      // FAMILY PROFILE
      connection.query(
        `SELECT
          p.resident_id as residentId,
          p.family_id as familyId,
          p.first_name as firstName,
          p.middle_name as middleName,
          p.last_name as lastName,
          p.suffix,
          p.sex,
          DATE_FORMAT(p.birthdate, '%m-%d-%Y') as birthdate,
          p.civil_status as civilStatus,
          p.religion,
          p.relation_to_family_head as relationToFamilyHead,
          p.birthplace, 

          pi.educational_attainment as educationalAttainment, 
          pi.skills,
          pi.occupation,
          pi.employment_type as employmentType,
          pi.monthly_income as monthlyIncome,

          ci.contact_number as contactNumber,

          hi.health_status as healthStatus, 

          gi.philhealth as philhealthNumber,

          DATE_FORMAT(a.date_become_officer, '%m-%d-%Y') as dateBecomeOfficer,
          DATE_FORMAT(a.date_become_member, '%m-%d-%Y') as dateBecomeMember,
          a.organization_name as organizationName,

          -- Check if affiliation exists
          CASE 
            WHEN a.resident_id IS NOT NULL 
            THEN TRUE 
            ELSE FALSE 
          END as affiliated,

          ni.settlement_details as settlementDetails,
          ni.ethnicity,
          ni.place_of_origin as placeOfOrigin,
          ni.house_owner as houseOwner,

          -- Convert transient to boolean
          CASE 
            WHEN ni.transient = 1 
            THEN TRUE 
            ELSE FALSE 
          END as transient,

          -- Check if non_ivatan exists
          CASE 
            WHEN ni.resident_id IS NOT NULL 
            THEN TRUE 
            ELSE FALSE 
          END as nonIvatan,

          CASE
            WHEN ni.date_registered IS NOT NULL
            THEN 'YES'
            ELSE 'NO'
          END as isRegistered,

          DATE_FORMAT(ni.date_registered, '%m-%d-%Y') as dateRegistered

        FROM population p
        LEFT JOIN professional_information pi ON p.resident_id = pi.resident_id
        LEFT JOIN contact_information ci ON p.resident_id = ci.resident_id
        LEFT JOIN health_information hi ON p.resident_id = hi.resident_id
        LEFT JOIN government_ids gi ON p.resident_id = gi.resident_id
        LEFT JOIN affiliation a ON p.resident_id = a.resident_id
        LEFT JOIN non_ivatan ni ON p.resident_id = ni.resident_id
        WHERE p.family_id = ?`,
        [familyId]
      ),

      // CLASSIFICATION
      connection.query(
        `SELECT
          sc.resident_id as residentId,
          sc.classification_code as classificationCode,
          sc.classification_name as classificationName
        FROM social_classification sc
        INNER JOIN population p ON sc.resident_id = p.resident_id
        WHERE p.family_id = ?`,
        [familyId]
      ),

      // EXPENSES
      connection.query(
        `SELECT 
        food_expenses_id as foodExpensesId,
        expense_type, 
        amount 
        FROM food_expenses 
        WHERE survey_id = ?
        
        UNION ALL

        SELECT 
        education_expenses_id as educationExpensesId,
        expense_type, 
        amount 
        FROM education_expenses 
        WHERE survey_id = ?

        UNION ALL
        
        SELECT 
        family_expenses_id as familyExpensesId,
        expense_type, 
        amount 
        FROM family_expenses 
        WHERE survey_id = ?

        UNION ALL

        SELECT 
        monthly_expenses_id as monthlyExpensesId,
        expense_type, 
        amount 
        FROM monthly_expenses 
        WHERE survey_id = ?`,
        [surveyId, surveyId, surveyId, surveyId]
      ),

      // HOUSEHOLD INFORMATION
      connection.query(
        `SELECT 
          household_id as householdId,
          house_structure as houseStructure,
          house_condition as houseCondition,
          latitude, 
          longitude,
          street as houseStreet,
          barangay,
          multipleFamily
         FROM households
         WHERE household_id = ?`,
         [householdId]
      ),

      // HOUSE IMAGES
      connection.query(
        `SELECT 
          house_image_id as houseImageId,
          house_image_url as houseImagePreviews,
          house_image_title as houseImageTitles
         FROM house_images
         WHERE household_id = ?`,
         [householdId]
      ),

      // WATER INFORMATION
      connection.query(
        `SELECT
          water_info_id AS waterInformationId,
          CASE 
            WHEN water_access = 1 THEN 'YES'
            WHEN water_access = 0 THEN 'NO'
            ELSE NULL
          END AS waterAccess,
          CASE 
            WHEN potable_water = 1 THEN 'YES'
            WHEN potable_water = 0 THEN 'NO'
            ELSE NULL
          END AS potableWater,
          water_sources AS waterSources
        FROM water_information
        WHERE household_id = ?`,
        [householdId]
      ),

      // LIVESTOCK
      connection.query(
        `SELECT 
        livestock_id as  livestockId,
        animal_type, 
        own, 
        dispersal 
        FROM livestock 
        WHERE survey_id = ?`,
        [surveyId]
      ),

      // FARMLOTS
      connection.query(
        `SELECT 
        farm_lots_id as farmlotsId,
        ownership_type as ownershipType,
        cultivation,
        pastureland,
        forestland
        FROM farm_lots 
        WHERE survey_id = ?`,
        [surveyId]
      ),

      // CROPS PLANTED
      connection.query(
        `SELECT 
        crops_planted_id as cropsPlantedId,
        crops, 
        planted_area 
        FROM crops_planted 
        WHERE survey_id = ?`,
        [surveyId]
      ),

      // FRUIT BEARING TREES
      connection.query(
        `SELECT 
        fruit_bearing_trees_id as fruitBearingTreesId,
        tree, 
        count 
        FROM fruit_bearing_trees 
        WHERE survey_id = ?`,
        [surveyId]
      ),

      // FAMILY RESOURCES
      connection.query(
        `SELECT 
        family_resources_id as familyResourcesId,
        resources, 
        amount
        FROM family_resources 
        WHERE survey_id = ?`,
        [surveyId]
      ),

      // APPLIANCES OWN
      connection.query(
        `SELECT 
        appliances_own_id as appliancesOwnId,
        appliance, 
        count 
        FROM appliances_own 
        WHERE survey_id = ?`,
        [surveyId]
      ),

      // AMENITIES
      connection.query(
        `SELECT 
        amenities_id as amenitiesId,
        amenity, 
        count 
        FROM amenities 
        WHERE survey_id = ?`,
        [surveyId]
      ),

      // COMMUNITY ISSUES
      connection.query(
        `SELECT 
          community_issues_id as communityIssuesId,
          community_issue as communityIssue
        FROM community_issues 
        WHERE survey_id = ?`,
        [surveyId]
      ),

      // SERVICE AVAILED
      connection.query(
        `SELECT 
          service_availed_id as serviceAvailedId,
          DATE_FORMAT(date_service_availed, '%m-%d-%Y') AS dateServiceAvailed,
          ngo_name as ngoName,
          service_availed as serviceAvailed,
          male_served as maleServed,
          female_served as femaleServed,
          how_service_help as howServiceHelp
        FROM service_availed
        WHERE family_id = ?`,
        [familyId]
      ),

      // ACKNOWLEDGEMENT
      connection.query(
        `SELECT
          respondent_photo_url as respondentPhotoPreviews,
          respondent_photo_id as respondentPhotoId,
          respondent_signature_url as respondentSignature,
          respondent_signature_id as respondentSignatureId
        FROM surveys
        WHERE survey_id = ?`,
        [surveyId]
      )
    ]);

    /* =======================
       Apply reducers
    ======================== */
    
    const expenses = expensesValueReducer('expense_type', 'amount')(expensesRows);
    const livestock = nestedReducer('animal_type', ['own', 'dispersal'])(livestockRows);
    const cropsPlanted = keyValueReducer('crops', 'planted_area')(cropsPlantedRows);
    const fruitBearingTrees = keyValueReducer('tree', 'count')(fruitBearingTreesRows);
    const familyResources = keyValueReducer('resources', 'amount')(familyResourcesRows);
    const appliancesOwn = keyValueReducer('appliance', 'count')(appliancesOwnRows);
    const amenities = keyValueReducer('amenity', 'count')(amenitiesRows);

    // HOUSEHOLD INFORMATION
    const householdInformationRow = householdInformationRows[0] || {};
    const householdInformation = {
      houseInformationId: householdInformationRow.houseInformationId,
      houseCondition: householdInformationRow.houseCondition || null,
      houseStructure: householdInformationRow.houseStructure || null,
      houseImageId: houseImages.map(img => img.houseImageId),
      houseImagePreviews: houseImages.map(img => img.houseImagePreviews),
      houseImageTitles: houseImages.map(img => img.houseImageTitles),
      position: [
        householdInformationRow.latitude, 
        householdInformationRow.longitude
      ],
      houseStreet: householdInformationRow.houseStreet,
      barangay: householdInformationRow.barangay,
      multipleFamily: householdInformationRow.multipleFamily
    };
    
    // WATER SOURCES
    const { waterSources, ...waterValues } = waterInformationRows[0] || {};
    const waterInformation = {
      ...waterValues,
      waterSources: waterSources?.split(", ")
    };

    const farmlots = farmlotsRows[0] || {};
    const communityIssues = communityIssuesRows[0] || {};
    const acknowledgement = acknowledgementRows[0] || {};

    // FAMILY PROFILE
    const classificationMap = {
      'OSY': { field: 'youthCategory', value: 'OSY' },
      'IS': { field: 'youthCategory', value: 'IS' },
      'PWD': { field: 'pwd', value: true },
      'OT': { field: 'outOfTown', value: true },
      'SP': { field: 'soloParent', value: true },
      'OFW': { field: 'ofw', value: true },
    };

    const classificationsByResident = {};

    classificationRows.forEach(classification => {
      if (!classificationsByResident[classification.residentId]) {
        classificationsByResident[classification.residentId] = [];
      }
      classificationsByResident[classification.residentId]
      .push(classification.classificationCode);
    });

    const familyProfile = familyProfileRows.map(member => {
      const transformed = { ...member };
      
      // Get all classifications for this resident
      const residentClassifications = classificationsByResident[member.residentId] || [];
      
      // Apply each classification
      residentClassifications.forEach(code => {
        const mapping = classificationMap[code];
        if (mapping) {
          transformed[mapping.field] = mapping.value;
        }
      });
      
      return transformed;
    });

    /* =======================
       Final Response
    ======================== */
    res.json({
      success: true,
      data: transformSurveyToFormData({
        surveyId: surveyId,
        householdId: householdId,
        familyId: familyId,
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
      })
    });
  } catch (error) {
    console.error('Error getting survey:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  } finally {
    connection.release();
  }
};
