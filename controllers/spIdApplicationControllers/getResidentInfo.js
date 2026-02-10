import pool from '../../config/db.js';

export const getResidentInfo = async (req, res) => {
  
  const connection = await pool.getConnection();

  try {
    const residentId = req.params.residentId;

    const [
      [personalInformationRows],
      [professionalInformationRows],
      [contactInformationRows]
    ] = await Promise.all([
      // PERSONAL INFORMATION
      connection.query(`
        SELECT 
            p.first_name AS firstName,
            p.middle_name AS middleName,
            p.last_name AS lastName,
            p.suffix,
            DATE_FORMAT(p.birthdate, '%m-%d-%Y') AS birthdate,
            p.sex,
            p.civil_status AS civilStatus,
            p.religion,
            p.birthplace,
            g.philsys AS philsysNumber,
            fi.household_id,
            EXISTS (
                SELECT 1
                FROM social_classification sc
                WHERE sc.resident_id = p.resident_id
                  AND sc.classification_code = 'PWD'
            ) AS pwd
        FROM population p
        LEFT JOIN government_ids g
            ON g.resident_id = p.resident_id
        JOIN family_information fi 
            ON p.family_id = fi.family_id
        WHERE p.resident_id = ?`,
        [residentId]
      ),

      // PROFESSIONAL INFORMATION
      connection.query(
        `SELECT
          educational_attainment as educationalAttainment,
          employment_status as employmentStatus,
          occupation,
          company,
          monthly_income as monthlyIncome
        FROM professional_information
        WHERE resident_id = ?`,
        [residentId]
      ),

      // CONTACT INFORMATION
      connection.query(`
        SELECT
            h.street AS houseStreet,
            h.barangay,
            c.telephone_number as landlineNumber, 
            c.contact_number as contactNumber, 
            c.email_address as emailAddress
        FROM population p
        LEFT JOIN contact_information c
            ON c.resident_id = p.resident_id
        LEFT JOIN family_information fi
            ON p.family_id = fi.family_id
        LEFT JOIN households h
            ON fi.household_id = h.household_id
        WHERE p.resident_id = ?;`,
        [residentId]
      )
    ]);

    const personalInformation = personalInformationRows[0] || {};
    const professionalInformation = professionalInformationRows[0] || {};
    const contactInformation = contactInformationRows[0] || {};
   
    /* =======================
       Final Response
    ======================== */
    res.json({
      success: true,
      data: {
        residentId : residentId,
        personalInformation,
        professionalInformation,
        contactInformation
      }
    });
  } catch (error) {
    console.error('Error getting application:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  } finally {
    connection.release();
  }
};
