import pool from '../../config/db.js';
import { cleanupLocalStorageUploads } from '../../utils/fileUtils.js';


export const deleteSeniorIdApplication = async (req, res) => {

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    //////////////////////////////////////////////////////////////////////

    const seniorCitizenId = req.params.seniorCitizenId;

    //////////////////////////////////////////////////////////////////////

    // GET UPLOADED FILES

    const [uploadedFilesRows] = await connection.query(`
      SELECT
        senior_citizen_photo_id_url as seniorCitizenPhotoId,
        senior_citizen_signature_url as seniorCitizenSignature
      FROM senior_citizen_id_applications
      WHERE senior_citizen_id = ?`,
      [seniorCitizenId]
    );

    //////////////////////////////////////////////////////////////////////

    // GET RESIDENT ID
    const [residentRows] = await pool.query(`
      SELECT 
        resident_id as residentId
      FROM senior_citizen_id_applications 
      WHERE senior_citizen_id = ?`,
      [seniorCitizenId]
    );

    const residentId = residentRows[0].residentId;

    //////////////////////////////////////////////////////////////////////

    // DELETE RELATED RECORDS ONLY IF TEMPORARY RESIDENT

    if (residentId?.startsWith('T-RID')) {
      await pool.query(
        `DELETE FROM population WHERE resident_id = ?`, [residentId]
      );
      await pool.query(
        `DELETE FROM professional_information WHERE resident_id = ?`, [residentId]
      );
      await pool.query(
        `DELETE FROM contact_information WHERE resident_id = ?`, [residentId]
      );
    } else {
      const [applications] = await connection.query(`
        SELECT 'pwd' AS type FROM pwd_id_applications WHERE resident_id = ?
        UNION
        SELECT 'solo_parent' FROM solo_parent_id_applications WHERE resident_id = ?`,
        [residentId, residentId]
      );

      if (applications.length === 0) {
        // PROFESSIONAL INFORMATION
        await connection.query(`
          UPDATE professional_information
          SET 
            employment_status = NULL,
            employment_category = NULL
          WHERE resident_id = ?
        `, [residentId]);

        // CONTACT INFORMATION
        await connection.query(`
          UPDATE contact_information
          SET 
            street = NULL,
            barangay = NULL,
            telephone_number = NULL,
            email_address = NULL
          WHERE resident_id = ?
        `, [residentId]);

        // GOVERNMENT IDs
        await connection.query(`
          UPDATE government_ids
          SET 
            sss = NULL,
            gsis = NULL,
            pagibig = NULL,
            philsys = NULL
          WHERE resident_id = ?
        `, [residentId]);
      }  
    }

    //////////////////////////////////////////////////////////////////////

    // DELETE SOLO PARENT ID APPLICATION
    await pool.query(
      `DELETE FROM senior_citizen_id_applications WHERE senior_citizen_id = ?`,
      [seniorCitizenId]
    );

    //////////////////////////////////////////////////////////////////////

    // DELETE IMAGE FROM LOCAL STORAGE

    await cleanupLocalStorageUploads({
      photoId: uploadedFilesRows[0].seniorCitizenPhotoId,
      signature: uploadedFilesRows[0].seniorCitizenSignature
    });

    //////////////////////////////////////////////////////////////////////

    return res.status(200).json({ 
      success: true,
      message: 'Application Deleted Successfully!',
      seniorCitizenId
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error deleting application:', error);

    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  } finally {
    connection.release();
  }
};