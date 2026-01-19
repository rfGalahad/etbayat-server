import pool from '../../config/db.js';

export const getPopulation = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        p.resident_id,
        CONCAT(
            p.last_name, ', ',
            p.first_name,
            IFNULL(CONCAT(' ', p.middle_name), ''),
            IFNULL(CONCAT(' ', p.suffix), '')
        ) AS name,
        p.sex,
        DATE_FORMAT(p.birthdate, '%m-%d-%Y') AS birthdate,
        hi.barangay
      FROM population p
      LEFT JOIN households hi
        ON p.household_id = hi.household_id
      WHERE p.resident_id LIKE 'RID%'
      ORDER BY name ASC;
    `);
    
    res.status(200).json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error fetching population data:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching population data', 
      error: error.message 
    });
  }
}


