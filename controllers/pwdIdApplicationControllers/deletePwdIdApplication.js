import pool from '../../config/db.js';
import { cleanupLocalStorageUploads } from '../../utils/fileUtils.js';

export const deletePwdIdApplication = async (req, res) => {

  const connection = await pool.getConnection();

  try {
    const pwdId = req.params.pwdId;

    await connection.beginTransaction();

    //////////////////////////////////////////////////////////////////////

    // GET UPLOADED FILESS

    const [uploadedFilesRows] = await connection.query(`
      SELECT
        pwd_photo_id_url as pwdPhotoId,
        pwd_signature_url as pwdSignature
      FROM pwd_id_applications
      WHERE pwd_id = ?`,
      [pwdId]
    );

    //////////////////////////////////////////////////////////////////////

    // GET RESIDENT ID

    const [residentRows] = await connection.query(`
      SELECT resident_id AS residentId
      FROM pwd_id_applications
      WHERE pwd_id = ?`,
      [pwdId]
    );

    const residentId = residentRows[0].residentId;

    //////////////////////////////////////////////////////////////////////

    // DELETE RELATED RECORDS ONLY IF TEMPORARY RESIDENT

    if (residentId?.startsWith('T-RID')) {
      await connection.query(`DELETE FROM population WHERE resident_id = ?`, [residentId]);
      await connection.query(`DELETE FROM professional_information WHERE resident_id = ?`, [residentId]);
      await connection.query(`DELETE FROM contact_information WHERE resident_id = ?`, [residentId]);
      await connection.query(`DELETE FROM health_information WHERE resident_id = ?`, [residentId]);
      await connection.query(`DELETE FROM government_ids WHERE resident_id = ?`, [residentId]);
    } else {

      const [applications] = await connection.query(`
        SELECT 'solo_parent' AS type FROM solo_parent_id_applications WHERE resident_id = ?
        UNION
        SELECT 'senior' FROM senior_citizen_id_applications WHERE resident_id = ?`,
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

        // HEALTH INFORMATION
        await connection.query(`
          UPDATE health_information
          SET 
            blood_type = NULL,
            disability_cause = NULL,
            disability_type = NULL,
            disability_specific = NULL
          WHERE resident_id = ?
        `, [residentId]);

        // GOVERNMENT IDs
        await connection.query(`
          UPDATE government_ids
          SET 
            sss = NULL,
            gsis = NULL,
            pagibig = NULL,
            philsys = NULL,
            psn = NULL
          WHERE resident_id = ?
        `, [residentId]);

      }       
    }

    //////////////////////////////////////////////////////////////////////

    // DELETE PWD ID APPLICATION

    await connection.query(
      `DELETE FROM pwd_id_applications WHERE pwd_id = ?`,
      [pwdId]
    );

    //////////////////////////////////////////////////////////////////////

    // DELETE IMAGE FROM LOCAL STORAGE

    await cleanupLocalStorageUploads({
      photoId: uploadedFilesRows[0].pwdPhotoId,
      signature: uploadedFilesRows[0].pwdSignature
    });

    //////////////////////////////////////////////////////////////////////

    await connection.commit();

    return res.status(200).json({
      success: true,
      message: 'Application deleted successfully',
      pwdId
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
