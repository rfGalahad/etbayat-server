import pool from '../../config/db.js';
import { deleteMultipleFromCloudinary } from '../../utils/cloudinaryUpload.js';


export const deleteSurvey = async (req, res) => {
  try {
    const { surveyId } = req.params;

    // 1️⃣ Get respondent images
    const [respondentRows] = await pool.query(
      `SELECT 
        respondent_photo_id AS respondentPhotoPublicId,
        respondent_signature_id AS respondentSignaturePublicId
       FROM surveys
       WHERE survey_id = ?`,
      [surveyId]
    );

    // 2️⃣ Get household_id THROUGH family_information
    const [familyRows] = await pool.query(
      `SELECT household_id AS householdId
       FROM family_information
       WHERE survey_id = ?`,
      [surveyId]
    );

    const householdId = familyRows?.[0]?.householdId;

    // 3️⃣ Get house images (if household exists)
    let houseImagesRows = [];
    if (householdId) {
      [houseImagesRows] = await pool.query(
        `SELECT house_image_public_id AS houseImagePublicId
         FROM house_images
         WHERE household_id = ?`,
        [householdId]
      );
    }

    // 4️⃣ Collect Cloudinary public IDs
    const publicIdsToDelete = [];

    if (houseImagesRows.length > 0) {
      publicIdsToDelete.push(
        ...houseImagesRows.map(img => img.houseImagePublicId).filter(Boolean)
      );
    }

    if (respondentRows.length > 0) {
      publicIdsToDelete.push(
        ...Object.values(respondentRows[0]).filter(Boolean)
      );
    }

    // 5️⃣ Delete images from Cloudinary
    if (publicIdsToDelete.length > 0) {
      await deleteMultipleFromCloudinary(publicIdsToDelete);
    }

    // 6️⃣ Delete survey
    // CASCADE will delete family_information row automatically
    await pool.query(
      `DELETE FROM surveys WHERE survey_id = ?`,
      [surveyId]
    );

    return res.status(200).json({
      success: true,
      message: 'Survey Deleted Successfully!',
      surveyId
    });

  } catch (error) {
    console.error('Error deleting survey:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
