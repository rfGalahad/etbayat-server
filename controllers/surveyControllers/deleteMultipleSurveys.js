import pool from '../../config/db.js';
import { deleteMultipleFromCloudinary } from '../../utils/cloudinaryUtils.js';


export const deleteMultipleSurveys = async (req, res) => {
  try {
    const { surveyId } = req.params;

    const [respondentRows] = await pool.query(
      `SELECT 
      respondent_photo_id as respondentPhotoPublicId,
      respondent_signature_id as respondentSignaturePublicId
      FROM surveys 
      WHERE survey_id = ?`,
      [surveyId]
    );

    const [householdRows] = await pool.query(
      `SELECT household_id as householdId
      FROM households
      WHERE survey_id = ?`,
      [surveyId]
    )

    const householdId = householdRows[0].householdId;

    const [houseImagesRows] = await pool.query(
      `SELECT house_image_public_id as houseImagePublicId
      FROM house_images 
      WHERE household_id = ?`,
      [householdId]
    );

    const publicIdsToDelete = [];

    if (houseImagesRows?.length > 0) {
      publicIdsToDelete.push(
        ...houseImagesRows
          .map(img => img.houseImagePublicId)
          .filter(Boolean)
      );
    }

    if (respondentRows?.length > 0) {
      publicIdsToDelete.push(
        ...Object.values(respondentRows[0]).filter(Boolean)
      );
    }

    if (publicIdsToDelete.length > 0) {
      await deleteMultipleFromCloudinary(publicIdsToDelete);
      console.log(`Cleaned up ${publicIdsToDelete.length} images from Cloudinary`);
    }

    await pool.query(
      `DELETE FROM surveys WHERE survey_id = ?`,
      [surveyId]
    );

    return res.status(200).json({ 
      success: true,
      message: 'Survey Deleted Successfully!',
      surveyId: surveyId
    });
  } catch (error) {
    console.error('Error deleting survey:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error'
    });
  }
};