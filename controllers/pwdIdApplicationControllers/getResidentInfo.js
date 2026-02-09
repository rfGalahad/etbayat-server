import pool from '../../config/db.js';

export const getResidentInfo = async (req, res) => {
  
  const connection = await pool.getConnection();

  try {
    const residentId = req.params.residentId;

    /* =======================
       Parallel Queries
    ======================== */
    const [
      [personalInformationRows],
      [professionalInformationRows],
      [contactInformationRows],
      [disabilityInformationRows],
      [governmentIdsRows]
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
          h.blood_type as bloodType
        FROM population p
        LEFT JOIN health_information h
          ON p.resident_id = h.resident_id
        WHERE p.resident_id = ?`,
        [residentId]
      ),

      // PROFESSIONAL INFORMATION
      connection.query(
        `SELECT
          educational_attainment as educationalAttainment,
          employment_status as employmentStatus,
          employment_type as employmentType,
          employment_category as employmentCategory,
          skills,
          occupation
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
      ),

      // DISABILITY INFORMATION
      connection.query(
        `SELECT
          disability_type as disabilityType,
          disability_cause as disabilityCause,
          disability_specific as disabilitySpecific
        FROM health_information
        WHERE resident_id = ?`,
        [residentId]
      ),

      // GOVERNMENT IDs
      connection.query(
        `SELECT
          sss as sssNumber,
          gsis as gsisNumber,
          psn as psnNumber,
          philhealth as philheathNumber,
          pagibig as pagibigNumber
        FROM government_ids
        WHERE resident_id = ?`,
        [residentId]
      )
    ]);

    const personalInformation = personalInformationRows[0] || {};
    const professionalInformation = professionalInformationRows[0] || {};
    const contactInformation = contactInformationRows[0] || {};
    const disabilityInformation = disabilityInformationRows[0] || {};
    const governmentIds = governmentIdsRows[0] || {};

    /* =======================
       Final Response
    ======================== */
    res.json({
      success: true,
      data: {
        residentId: residentId,
        personalInformation,
        professionalInformation,
        contactInformation,
        disabilityInformation,
        governmentIds
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
