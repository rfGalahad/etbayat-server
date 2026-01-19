import pool from '../../config/db.js';
import { deleteMultipleFromCloudinary } from '../../utils/cloudinaryUpload.js';


export const deletePwdIdApplication = async (req, res) => {
  try {
    const { pwdId } = req.params;

    // DELETE IMAGES FROM CLOUDINARY
    const [applicantRows] = await pool.query(`
      SELECT 
        pwd_photo_id_public_Id as pwdPhotoPublicId,
        pwd_signature_public_id as pwdSignaturePublicId
      FROM pwd_id_applications 
      WHERE pwd_id = ?`,
      [pwdId]
    );

    const publicIdsToDelete = [];

    if (applicantRows?.length > 0) {applicantRows
      publicIdsToDelete.push(
        ...Object.values(applicantRows[0]).filter(Boolean)
      );
    }

    if (publicIdsToDelete.length > 0) {
      await deleteMultipleFromCloudinary(publicIdsToDelete);
      console.log(`Cleaned up ${publicIdsToDelete.length} images from Cloudinary`);
    }

    // GET RESIDENT ID
    const [residentIdRows] = await pool.query(`
      SELECT 
        resident_id as residentId
      FROM pwd_id_applications 
      WHERE pwd_id = ?`,
      [pwdId]
    );

    const residentId = residentIdRows[0].residentId;

    // DELETE APPLICANT INFORMATION
    await pool.query(
      `DELETE FROM population WHERE resident_id = ?`, [residentId]
    );
    await pool.query(
      `DELETE FROM professional_information WHERE resident_id = ?`, [residentId]
    );
    await pool.query(
      `DELETE FROM contact_information WHERE resident_id = ?`, [residentId]
    );
    await pool.query(
      `DELETE FROM health_information WHERE resident_id = ?`, [residentId]
    );
    await pool.query(
      `DELETE FROM government_ids WHERE resident_id = ?`, [residentId]
    );

    // DELETE PWD ID APPLICATION
    await pool.query(
      `DELETE FROM pwd_id_applications WHERE pwd_id = ?`,
      [pwdId]
    );

    return res.status(200).json({ 
      success: true,
      message: 'Application Deleted Successfully!',
      pwdId: pwdId
    });
  } catch (error) {
    console.error('Error deleting application:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error'
    });
  }
};