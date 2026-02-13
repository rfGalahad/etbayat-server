import pool from '../../config/db.js';
import { 
  getSurveyByIdService 
} from '../../services/surveyService/getSurveyByIdService.js';
import { 
  transformSurveyToFormData 
} from '../../utils/transformers/surveyFormTransformers.js';

export const getSurveyById = async (req, res) => {
   
  const connection = await pool.getConnection();

  try {
    const surveyId = req.params.surveyId;

    const result = await getSurveyByIdService(surveyId);

    res.json({
      success: true,
      data: transformSurveyToFormData(result)
    });
  } catch (error) {
    console.error('Error getting survey:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  } finally {
    connection.release();
  }
};
