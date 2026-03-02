import pool from '../../config/db.js';

export const getAllHouseholdHeads = async (req, res) => {
  try {
    const { role, userId } = req.user;

    const [rows] = await pool.query(`
      SELECT 
        family_head_first_name  AS firstName,
        family_head_middle_name AS middleName,
        family_head_last_name   AS lastName,
        family_head_suffix      AS suffix,
        barangay
      FROM households
      WHERE 
        family_head_first_name  IS NOT NULL AND TRIM(family_head_first_name)  <> ''
        AND family_head_last_name IS NOT NULL AND TRIM(family_head_last_name) <> ''
        AND barangay              IS NOT NULL AND TRIM(barangay)              <> ''
    `);

    res.status(200).json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error fetching household heads:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching household heads', 
      error: error.message 
    });
  }
}
