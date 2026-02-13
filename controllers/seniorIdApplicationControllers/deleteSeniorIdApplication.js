import pool from '../../config/db.js';
import { deleteMultipleFromCloudinary } from '../../utils/cloudinaryUtils.js';


export const deleteSeniorIdApplication = async (req, res) => {
  try {
    const { seniorCitizenId } = req.params;

    // DELETE IMAGES FROM CLOUDINARY
    const [applicantRows] = await pool.query(`
      SELECT 
        senior_citizen_photo_id_public_Id as seniorCitizenPhotoPublicId,
        senior_citizen_signature_public_id as seniorCitizenSignaturePublicId
      FROM senior_citizen_id_applications 
      WHERE senior_citizen_id = ?`,
      [seniorCitizenId]
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
      FROM senior_citizen_id_applications 
      WHERE senior_citizen_id = ?`,
      [seniorCitizenId]
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

    // DELETE SOLO PARENT ID APPLICATION
    await pool.query(
      `DELETE FROM senior_citizen_id_applications WHERE senior_citizen_id = ?`,
      [seniorCitizenId]
    );

    return res.status(200).json({ 
      success: true,
      message: 'Application Deleted Successfully!',
      seniorCitizenId: seniorCitizenId
    });
  } catch (error) {
    console.error('Error deleting application:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error'
    });
  }
};