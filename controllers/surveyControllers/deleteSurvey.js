import pool from '../../config/db.js';
import { deleteMultipleFromCloudinary } from '../../utils/cloudinaryUtils.js';


export const deleteSurvey = async (req, res) => {
  try {
    const { surveyId } = req.params;

    if (!surveyId) {
      return res.status(400).json({
        success: false,
        message: 'Survey ID is required'
      });
    }

    // ============================================================
    // 1. GET RESPONDENT IMAGE PUBLIC IDS
    // ============================================================

    const [respondentRows] = await pool.query(
      `SELECT 
         respondent_photo_id AS respondentPhotoPublicId,
         respondent_signature_id AS respondentSignaturePublicId
       FROM surveys
       WHERE survey_id = ?`,
      [surveyId]
    );

    const respondentImages = respondentRows[0] || {};

    // ============================================================
    // 2. GET HOUSEHOLD ID ASSOCIATED WITH THIS SURVEY
    // ============================================================

    const [familyRows] = await pool.query(
      `SELECT household_id AS householdId
       FROM family_information
       WHERE survey_id = ?`,
      [surveyId]
    );

    const householdId = familyRows?.[0]?.householdId;

    // ============================================================
    // 3. DETERMINE IF HOUSEHOLD SHOULD ALSO BE DELETED
    //    (Only if no other families exist under it)
    // ============================================================

    let shouldDeleteHousehold = false;

    if (householdId) {
      const [countRows] = await pool.query(
        `SELECT COUNT(*) AS familyCount
         FROM family_information
         WHERE household_id = ? AND survey_id != ?`,
        [householdId, surveyId]
      );

      const familyCount = countRows[0].familyCount;
      shouldDeleteHousehold = familyCount === 0;
    }

    // ============================================================
    // 4. COLLECT HOUSE IMAGE PUBLIC IDS (IF HOUSEHOLD IS DELETED)
    // ============================================================

    let houseImagePublicIds = [];

    if (householdId && shouldDeleteHousehold) {
      const [houseImageRows] = await pool.query(
        `SELECT house_image_public_id AS houseImagePublicId
         FROM house_images
         WHERE household_id = ?`,
        [householdId]
      );

      houseImagePublicIds = houseImageRows
        .map(row => row.houseImagePublicId)
        .filter(Boolean);
    }

    // ============================================================
    // 5. COLLECT ALL CLOUDINARY PUBLIC IDS
    // ============================================================

    const respondentPublicIds = Object.values(respondentImages).filter(Boolean);

    const publicIdsToDelete = [
      ...houseImagePublicIds,
      ...respondentPublicIds
    ];

    // ============================================================
    // 6. DELETE FILES FROM CLOUDINARY
    // ============================================================

    if (publicIdsToDelete.length > 0) {
      await deleteMultipleFromCloudinary(publicIdsToDelete);
    }

    // ============================================================
    // 7. DELETE HOUSEHOLD (IF APPLICABLE)
    // ============================================================

    if (householdId && shouldDeleteHousehold) {
      await pool.query(
        `DELETE FROM households WHERE household_id = ?`,
        [householdId]
      );
    }

    // ============================================================
    // 8. DELETE SURVEY
    // ============================================================

    await pool.query(
      `DELETE FROM surveys WHERE survey_id = ?`,
      [surveyId]
    );

    return res.status(200).json({
      success: true,
      message: 'Survey deleted successfully!',
      surveyId
    });

  } catch (error) {
    console.error('Error deleting survey:', error);

    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};