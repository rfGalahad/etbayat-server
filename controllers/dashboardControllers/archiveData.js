import pool from '../../config/db.js';


export const archiveData = async (req, res) => {
  try {
    const { year } = req.body;
  
    if (!year) {
      return res.status(400).json({ success: false, message: 'Year is required' });
    }

    // Delete existing archive for that year first
    const tables = [
      'surveys_history',
      'households_history',
      'family_information_history',
      'population_history',
      'social_classification_history',
      'professional_information_history',
      'health_information_history',
      'contact_information_history',
      'affiliation_history',
      'non_ivatan_history',
      'water_information_history',
      'food_expenses_history',
      'education_expenses_history',
      'family_expenses_history',
      'monthly_expenses_history',
      'livestock_history',
      'farm_lots_history',
      'crops_planted_history',
      'fruit_bearing_trees_history',
      'family_resources_history',
      'appliances_own_history',
      'amenities_history',
      'community_issues_history',
    ];

    for (const table of tables) {
      await pool.query(`DELETE FROM ${table}`);
    }

    // Run the archive procedure
    await pool.query(`CALL archive_survey_data(?)`, [year]);

    res.status(200).json({ 
      success: true, 
      message: `Data for year ${year} has been successfully archived.`
    });

  } catch (err) {
    console.error('Error archiving data:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};