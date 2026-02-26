import pool from '../../config/db.js';

export const getNonIvatanMasterlist = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
          p.resident_id AS residentId,
          CONCAT(
            p.last_name, ', ',
            p.first_name,
            IF(p.middle_name IS NOT NULL AND p.middle_name <> '', CONCAT(' ', p.middle_name), ''),
            IF(p.suffix IS NOT NULL AND p.suffix <> '', CONCAT(' ', p.suffix), '')
          ) AS name,
          DATE_FORMAT(p.birthdate, '%m-%d-%Y') AS birthdate,
          TIMESTAMPDIFF(YEAR, p.birthdate, CURDATE()) AS age,
          p.sex,
          nic.settlement_details AS settlementDetails,
          nic.ethnicity,
          nic.place_of_origin AS placeOfOrigin,
          CASE 
            WHEN nic.transient = 1 
            THEN 'YES' 
            ELSE 'NO' 
          END AS transient,
          nic.house_owner AS houseOwner,
          DATE_FORMAT(nic.date_registered, '%m-%d-%Y') AS dateRegistered,
          h.barangay AS barangay
      FROM population p
      INNER JOIN social_classification sc
        ON p.resident_id = sc.resident_id
      INNER JOIN non_ivatan nic
        ON p.resident_id = nic.resident_id
      INNER JOIN family_information fi
        ON p.family_id = fi.family_id
      INNER JOIN households h
        ON fi.household_id = h.household_id
      WHERE sc.classification_code = 'IPULA'
      ORDER BY 
        p.last_name,
        p.first_name,
        p.middle_name,
        p.suffix;
    `);
    
    res.status(200).json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error fetching non-ivatan masterlist data:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching non-ivatan masterlist data', 
      error: error.message 
    });
  }
}


