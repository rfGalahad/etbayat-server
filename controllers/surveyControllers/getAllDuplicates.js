import pool from '../../config/db.js';

export const getAllDuplicates = async (req, res) => {
  console.log('GETTING ROWS')
  try {
    const [rows] = await pool.query(`
      SELECT
        TRIM(LOWER(p.first_name)) AS match_first_name,
        TRIM(LOWER(p.last_name)) AS match_last_name,
        DATE_FORMAT(p.birthdate, '%m-%d-%Y') AS birthdate,
        p.sex,

        COUNT(DISTINCT hi.barangay) AS barangay_count,

        JSON_ARRAYAGG(
            JSON_OBJECT(
                'resident_id', p.resident_id,
                'first_name', p.first_name,
                'middle_name', p.middle_name,
                'last_name', p.last_name,
                'suffix', p.suffix,
                'birthdate', CAST(DATE_FORMAT(p.birthdate, '%m-%d-%Y') AS CHAR),
                'sex', p.sex,
                'barangay', hi.barangay,
                'street', hi.street,
                'municipality', hi.municipality,
                'household_id', p.household_id
            )
        ) AS residents
    FROM population p
    JOIN households h ON p.household_id = h.household_id
    JOIN house_information hi ON h.household_id = hi.household_id
    GROUP BY
        match_first_name,
        match_last_name,
        p.birthdate,
        p.sex
    HAVING COUNT(DISTINCT hi.barangay) > 1
    ORDER BY
        match_last_name,
        match_first_name;
    `);

    console.log('ROWS', rows);

    res.status(200).json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error fetching duplicates data:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching duplicates data', 
      error: error.message 
    });
  }
}