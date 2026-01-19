import pool from '../../config/db.js';

export const getSeniorIdApplicationById = async (req, res) => {
  
  const connection = await pool.getConnection();

  try {
    const seniorCitizenId = req.params.seniorCitizenId;

    // GET RESIDENT ID
    const [seniorCitizenIdApplicationRows] = await connection.query(
      `SELECT 
        resident_id as residentId
      FROM senior_citizen_id_applications
      WHERE senior_citizen_id = ?`,
      [seniorCitizenId]
    );

    const residentId = seniorCitizenIdApplicationRows[0].residentId;

    const [
      [personalInformationRows],
      [professionalInformationRows],
      [contactInformationRows],
      [oscaInformationRows],
      [familyComposition],
      [seniorCitizenMediaRows]
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
          p.birthplace
        FROM population p
        INNER JOIN senior_citizen_id_applications pa
          ON p.resident_id = pa.resident_id
        WHERE pa.resident_id = ?`,
        [residentId]
      ),

      // PROFESSIONAL INFORMATION
      connection.query(
        `SELECT
          educational_attainment as educationalAttainment,
          skills,
          occupation,
          annual_income as annualIncome
        FROM professional_information
        WHERE resident_id = ?`,
        [residentId]
      ),

      // CONTACT INFORMATION
      connection.query(
        `SELECT
          street as houseStreet,
          barangay,
          contact_number as contactNumber
        FROM contact_information
        WHERE resident_id = ?`,
        [residentId]
      ),

      // OSCA INFORMATION
      connection.query(`
        SELECT
          association_name as associationName,
          DATE_FORMAT(date_elected_as_officer, '%m-%d-%Y') as dateElectedAsOfficer,
          position
        FROM osca_information
        WHERE senior_citizen_id = ?`,
        [seniorCitizenId] 
      ),

      // FAMILY COMPOSITION
      connection.query(`
        SELECT
          family_composition_id AS familyCompositionId,
          first_name AS firstName,
          middle_name AS middleName,
          last_name AS lastName,
          suffix,
          sex,
          relationship,
          DATE_FORMAT(birthdate, '%m-%d-%Y') AS birthdate,
          civil_status AS civilStatus,
          occupation,
          annual_income AS annualIncome
        FROM family_composition
        WHERE senior_citizen_id = ?`,
        [seniorCitizenId]
      ),

      // SENIOR CITIZEN MEDIA
      connection.query(`
        SELECT
          senior_citizen_photo_id_url as seniorCitizenPhotoIdPreview,
          senior_citizen_photo_id_public_id as seniorCitizenPhotoIdPublicId,
          senior_citizen_signature_url as seniorCitizenSignature,
          senior_citizen_signature_public_id as seniorCitizenSignaturePublicId
        FROM senior_citizen_id_applications
        WHERE resident_id = ?`,
        [residentId]
      )
    ]);

    const personalInformation = personalInformationRows[0] || {};
    const professionalInformation = professionalInformationRows[0] || {};
    const contactInformation = contactInformationRows[0] || {};
    const oscaInformation = oscaInformationRows[0] || {};
    const seniorCitizenMedia = seniorCitizenMediaRows[0] || {};
   
    /* =======================
       Final Response
    ======================== */
    res.json({
      success: true,
      data: {
        residentId : residentId,
        personalInformation,
        professionalInformation,
        contactInformation,
        oscaInformation,
        familyComposition,
        seniorCitizenMedia
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
