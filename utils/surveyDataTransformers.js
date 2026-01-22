import { CLASSIFICATIONS } from "../constants/surveyConstants.js";
import { formatDateForMySQL, parseIncome } from "./helpers.js";

// SURVEY DATA

const prepareExpenseValues = (surveyId, expenses) => {

  const foodExpenses = [
    { type: 'Rice', amount: parseIncome(expenses['Rice']) },
    { type: 'Viand', amount: parseIncome(expenses['Viand']) },
    { type: 'Sugar', amount: parseIncome(expenses['Sugar']) },
    { type: 'Milk', amount: parseIncome(expenses['Milk']) },
    { type: 'Oil', amount: parseIncome(expenses['Oil']) },
    { type: 'Snacks', amount: parseIncome(expenses['Snacks']) },
    { type: 'Other Food Expenses', amount: parseIncome(expenses['Other Food Expenses']) },
  ];

  const educationExpenses = [
    { type: 'Tuition Fees', amount: parseIncome(expenses['Tuition Fees']) },
    { type: 'Miscellaneous Fees', amount: parseIncome(expenses['Miscellaneous Fees']) },
    { type: 'School Supplies', amount: parseIncome(expenses['School Supplies']) },
    { type: 'Transportation', amount: parseIncome(expenses.Transportation) },
    { type: 'Rent/Dormitory', amount: parseIncome(expenses['Rent/Dormitory']) },
    { type: 'Other Education Expenses', amount: parseIncome(expenses['Other Education Expenses']) },
  ];

  const familyExpenses = [
    { type: 'Firewood', amount: parseIncome(expenses.Firewood) },
    { type: 'Gas Tank', amount: parseIncome(expenses['Gas Tank']) },
    { type: 'Caregivers', amount: parseIncome(expenses.Caregivers) },
    { type: 'Laundry', amount: parseIncome(expenses.Laundry) },
    { type: 'Hygiene', amount: parseIncome(expenses.Hygiene) },
    { type: 'Clothings', amount: parseIncome(expenses.Clothings) },
    { type: 'Other Family Expenses', amount: parseIncome(expenses['Other Family Expenses']) },
  ];

  const monthlyExpenses = [
    { type: 'Electric Bill', amount: parseIncome(expenses['Electric Bill']) },
    { type: 'Water Bill', amount: parseIncome(expenses['Water Bill']) },
    { type: 'Subscription', amount: parseIncome(expenses.Subscription) },
    { type: 'Mobile Load', amount: parseIncome(expenses['Mobile Load']) },
    { type: 'Other Monthly Expenses', amount: parseIncome(expenses['Other Monthly Expenses']) },
  ];

  // Filter and map to database format
  const filterAndMap = (expenseArray) => 
    expenseArray
      .filter(e => e.amount !== '' && e.amount !== null)
      .map(e => [surveyId, e.type, e.amount]);

  return {
    food: filterAndMap(foodExpenses),
    education: filterAndMap(educationExpenses),
    family: filterAndMap(familyExpenses),
    monthly: filterAndMap(monthlyExpenses)
  };
};

const prepareLivestockValues = (surveyId, livestock) => {
  return Object.entries(livestock).map(
    ([animalType, data]) => [
      surveyId,
      animalType,
      Number(data.own),
      Number(data.dispersal)
    ]
  );
};

const prepareCropsPlantedValues = (surveyId, cropsPlanted) => {
  return Object.entries(cropsPlanted)
    .filter(([_, count]) => count !== '' && count !== null && count !== undefined)
    .map(([crops, count]) => [
      surveyId,
      crops,
      Number(count)
    ]);
};

const prepareFruitBearingTreeValues = (surveyId, fruitBearingTree) => {
  return Object.entries(fruitBearingTree)
    .filter(([_, count]) => count !== '' && count !== null && count !== undefined)
    .map(
      ([tree, count]) => [
        surveyId,
        tree,
        Number(count)
    ]);
};

const prepareFamilyResourcesValues = (surveyId, familyResources) => {
  return Object.entries(familyResources)
    .filter(([_, amount]) => amount !== '' && amount !== null && amount !== undefined)
    .map(
      ([resources, amount]) => [
        surveyId,
        resources,
        parseIncome(amount)
    ]);
};

const prepareAppliancesOwnValues = (surveyId, appliancesOwn) => {
  return Object.entries(appliancesOwn)
    .filter(([_, count]) => count !== '' && count !== null && count !== undefined)
    .map(
      ([appliance, count]) => [
        surveyId,
        appliance,
        Number(count)
    ]);
};

const prepareAmenitiesValues = (surveyId, amenities) => {
  return Object.entries(amenities)
    .filter(([_, count]) => count !== '' && count !== null && count !== undefined)
    .map(
      ([amenity, count]) => [
        surveyId,
        amenity,
        Number(count)
    ]);
};

export const prepareSurveyDataValues = (surveyId, data) => {
  const expenseValues = prepareExpenseValues(surveyId, data.expenses);
  const livestockValues = prepareLivestockValues(surveyId, data.livestock);
  const cropsPlantedValues = prepareCropsPlantedValues(surveyId, data.cropsPlanted);
  const fruitBearingTreeValues = prepareFruitBearingTreeValues(surveyId, data.fruitBearingTrees);
  const familyResourcesValues = prepareFamilyResourcesValues(surveyId, data.familyResources);
  const appliancesOwnValues = prepareAppliancesOwnValues(surveyId, data.appliancesOwn);
  const amenitiesValues = prepareAmenitiesValues(surveyId, data.amenities);

  return {
    foodValues: expenseValues.food,
    educationValues: expenseValues.education,
    familyValues: expenseValues.family,
    monthlyValues: expenseValues.monthly,

    livestockValues,
    cropsPlantedValues,
    fruitBearingTreeValues,
    familyResourcesValues,
    appliancesOwnValues,
    amenitiesValues
  }
};

//////////////////////////////////////////////////////

// SERVICE / ASSISTANCE AVAILED

export const prepareServiceAvailedValues = (familyId, serviceAvailed) => {
  return serviceAvailed.map((service, index) => [ 
    familyId, 
    formatDateForMySQL(service.dateServiceAvailed),
    service.ngoName,
    service.serviceAvailed,
    Number(service.maleServed) || 0,
    Number(service.femaleServed) || 0,
    service.howServiceHelp
  ]);
};

//////////////////////////////////////////////////////

// POPULATION / RESIDENT 

const assignResidentIds = (familyId, familyProfile) => {
  familyProfile.forEach((member, index) => {
    if (!member.residentId) {
      member.residentId = `${familyId}-${index + 1}`;
    }
  });
};

const preparePopulationValues = (familyId, familyProfile) => {
  return familyProfile.map((member, index) => [ 
    member.residentId,
    familyId, 
    member.firstName || null,
    member.middleName || null,
    member.lastName || null,
    member.suffix || null,
    member.sex || null,
    formatDateForMySQL(member.birthdate) || null,
    member.civilStatus || null,
    member.religion || null,
    member.relationToFamilyHead || null,
    member.birthplace || null,
  ]);
};

const prepareProfessionalValues = (familyProfile) => {
  return familyProfile.map((member, index) => [ 
    member.residentId, 
    member.educationalAttainment || null,
    member.skills || null,
    member.occupation || null,
    member.employmentType || null,
    parseIncome(member.monthlyIncome),
  ]);
}; 

const prepareContactValues = (familyProfile) => {
  return familyProfile.map((member, index) => [ 
    member.residentId, 
    member.contactNumber || null
  ]);
};

const prepareHealthValues = (familyProfile) => {
  return familyProfile.map((member, index) => [ 
    member.residentId, 
    member.healthStatus || null
  ]);
};

const prepareGovernmentIdValues = (familyProfile) => {
  return familyProfile.map((member, index) => [ 
    member.residentId, 
    member.philhealthNumber || null
  ]);
};

const prepareAffiliationValues = (familyProfile) => {
  const affiliatedMembers = familyProfile
    .map((member, index) => ({ ...member, index }))
    .filter(member => member.affiliated);

  if (affiliatedMembers.length === 0) return null;

  return affiliatedMembers.map(member => [
    member.residentId,
    formatDateForMySQL(member.dateBecomeOfficer) || null,
    formatDateForMySQL(member.dateBecomeMember) || null,
    member.organizationName || null
  ]);
};

const prepareNonIvatanValues = (familyProfile) => {
  const nonIvatanMembers = familyProfile
    .map((member, index) => ({ ...member, index }))
    .filter(member => member.nonIvatan);

  if (nonIvatanMembers.length === 0) return null;

  return nonIvatanMembers.map((member, index) => [ 
    member.residentId, 
    member.settlementDetails || null,
    member.ethnicity || null,
    member.placeOfOrogin || null,
    Boolean(member.transient),
    member.houseOwner,
    formatDateForMySQL(member.dateRegistered)
  ]);
};

const prepareSocialClassifications = (familyProfile, CLASSIFICATIONS) => {
  const values = [];

  familyProfile.forEach((member, index) => {
    const residentId = member.residentId;

    if (member.ofw) {
      values.push([
        residentId,
        CLASSIFICATIONS.ofw.code,
        CLASSIFICATIONS.ofw.name
      ]);
    }

    if (member.outOfTown) {
      values.push([
        residentId,
        CLASSIFICATIONS.outOfTown.code,
        CLASSIFICATIONS.outOfTown.name
      ]);
    }

    if (member.pwd) {
      values.push([
        residentId,
        CLASSIFICATIONS.pwd.code,
        CLASSIFICATIONS.pwd.name
      ]);
    }

    if (member.soloParent) {
      values.push([
        residentId,
        CLASSIFICATIONS.soloParent.code,
        CLASSIFICATIONS.soloParent.name
      ]);
    }

    if (member.nonIvatan) {
      values.push([
        residentId,
        CLASSIFICATIONS.nonIvatan.code,
        CLASSIFICATIONS.nonIvatan.name
      ]);
    }

    if (member.youthCategory && CLASSIFICATIONS[member.youthCategory]) {
      values.push([
        residentId,
        CLASSIFICATIONS[member.youthCategory].code,
        CLASSIFICATIONS[member.youthCategory].name
      ]);
    }
  });

  return values.length > 0 ? values : null;
};

export const prepareResidentValues = (familyId, familyProfile) => {

  assignResidentIds(familyId, familyProfile);
  
  const populationValues = preparePopulationValues(familyId, familyProfile);
  const socialClassificationValues = prepareSocialClassifications(
    familyProfile, 
    CLASSIFICATIONS
  );
  const professionalValues = prepareProfessionalValues(familyProfile);
  const contactValues = prepareContactValues(familyProfile);
  const healthValues = prepareHealthValues(familyProfile);
  const governmentIdValues = prepareGovernmentIdValues(familyProfile);
  const affiliationValues = prepareAffiliationValues(familyProfile);
  const nonIvatanValues = prepareNonIvatanValues(familyProfile);

  return {
    populationValues,
    socialClassificationValues,
    professionalValues,
    contactValues,
    healthValues,
    governmentIdValues,
    affiliationValues,
    nonIvatanValues
  }
}




