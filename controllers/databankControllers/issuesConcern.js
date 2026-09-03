import pool from '../../config/db.js';

export const getIssuesConcern = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
          s.survey_id AS surveyId,
          h.barangay,
          ci.community_issue AS issues
      FROM surveys s
      JOIN family_information fi ON fi.survey_id = s.survey_id
      JOIN households h ON h.household_id = fi.household_id
      JOIN community_issues ci ON ci.survey_id = s.survey_id
      WHERE ci.community_issue IS NOT NULL 
        AND TRIM(ci.community_issue) <> ''
      ORDER BY s.survey_id;
    `);
    
    res.status(200).json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error fetching issues and concern data:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching issues and concern data', 
      error: error.message 
    });
  }
}


