import pool from '../../config/db.js';

export const getIssuesConcern = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        s.survey_id,
        h.barangay,
        ci.community_issue AS issues
      FROM surveys s
      JOIN family_information fi ON fi.survey_id = s.survey_id
      JOIN households h ON h.household_id = fi.household_id
      LEFT JOIN community_issues ci ON ci.survey_id = s.survey_id
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


