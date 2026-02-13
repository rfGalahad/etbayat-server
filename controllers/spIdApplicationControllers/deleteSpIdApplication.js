import pool from '../../config/db.js';
import { deleteMultipleFromCloudinary } from '../../utils/cloudinaryUtils.js';


export const deleteSpIdApplication = async (req, res) => {
  try {
    const { soloParentId } = req.params;

    // DELETE IMAGES FROM CLOUDINARY
    const [applicantRows] = await pool.query(`
      SELECT 
        solo_parent_photo_id_public_Id as soloParentPhotoPublicId,
        solo_parent_signature_public_id as soloParentSignaturePublicId
      FROM solo_parent_id_applications 
      WHERE solo_parent_id = ?`,
      [soloParentId]
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
      FROM solo_parent_id_applications 
      WHERE solo_parent_id = ?`,
      [soloParentId]
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

    // DELETE SOLO PARENT ID APPLICATION
    await pool.query(
      `DELETE FROM solo_parent_id_applications WHERE solo_parent_id = ?`,
      [soloParentId]
    );

    return res.status(200).json({ 
      success: true,
      message: 'Application Deleted Successfully!',
      soloParentId: soloParentId
    });
  } catch (error) {
    console.error('Error deleting application:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error'
    });
  }
};