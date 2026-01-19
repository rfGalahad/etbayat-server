export const transformSurveyToFormData = (apiData = {}) => {
  return {
    surveyId: apiData.surveyId,
    householdId: apiData.householdId,
    familyId: apiData.familyId,
    
    familyInformation: apiData.familyInformation ?? {},

    familyProfile: apiData.familyProfile ?? [],

    expenses: apiData.expenses ?? {},

    householdInformation: apiData.householdInformation ?? {},
    waterInformation: apiData.waterInformation ?? {}, 

    livestock: apiData.livestock ?? {},
    farmlots: apiData.farmlots ?? {},
    cropsPlanted: apiData.cropsPlanted ?? {},
    fruitBearingTrees: apiData.fruitBearingTrees ?? {}, 

    familyResources: apiData.familyResources ?? {},
    appliancesOwn: apiData.appliancesOwn ?? {},
    amenities: apiData.amenities ?? {},

    communityIssues: apiData.communityIssues ?? {},

    serviceAvailed: apiData.serviceAvailed ?? [],

    acknowledgement: apiData.acknowledgement ?? {}
  };
};
