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
          first_name as firstName,
          middle_name as middleName,
          last_name as lastName,
          suffix,
          DATE_FORMAT(birthdate, '%m-%d-%Y') as birthdate,
          sex,
          civil_status as civilStatus,
          birthplace
        FROM population 
        WHERE resident_id = ?`,
        [residentId]
      ),

      // PROFESSIONAL INFORMATION
      connection.query(
        `SELECT
          educational_attainment as educationalAttainment,
          skills,
          occupation,
          other_occupation AS otherOccupation,
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
