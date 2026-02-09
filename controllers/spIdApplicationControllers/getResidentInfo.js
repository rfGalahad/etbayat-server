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
      connection.query(
        `SELECT
          p.first_name as firstName,
          p.middle_name as middleName,
          p.last_name as lastName,
          p.suffix,
          DATE_FORMAT(p.birthdate, '%m-%d-%Y') as birthdate,
          p.sex,
          p.civil_status as civilStatus,
          p.religion,
          p.birthplace,
          g.philsys as philsysNumber,


          CASE
            WHEN pa.pantawid_beneficiary =  1
            THEN TRUE
            ELSE FALSE
          END AS pantawidBeneficiary,

          pa.beneficiary_code as beneficiaryCode,
          pa.household_id as householdId,

          CASE
            WHEN pa.indigenous_person = 1
            THEN TRUE
            ELSE FALSE
          END AS indigenousPerson,

          pa.indigenous_affiliation as indigenousAffiliation,

          CASE
            WHEN pa.lgbtq = 1
            THEN TRUE
            ELSE FALSE
          END,

          CASE
            WHEN pa.pwd = 1
            THEN TRUE
            ELSE FALSE
          END

        FROM population p
        LEFT JOIN government_ids g
          ON p.resident_id = g.resident_id
        INNER JOIN solo_parent_id_applications pa
          ON p.resident_id = pa.resident_id
        WHERE pa.resident_id = ?`,
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
      connection.query(
        `SELECT
          street as houseStreet,
          barangay,
          telephone_number as landlineNumber,
          contact_number as contactNumber,
          email_address as emailAddress
        FROM contact_information
        WHERE resident_id = ?`,
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
