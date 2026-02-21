import { 
  updateSurveyService
} from '../../services/surveyService/updateSurveyService.js';

export const updateSurvey = async (req, res, next) => {  
  try {
    const formData = JSON.parse(req.body.formData);
    const userId = req.user.userId;
    const files = req.files || {};

    const surveyId = await updateSurveyService(
      formData, 
      userId, 
      files
    );
    
    return res.status(201).json({ 
      success: true,
      message: 'Survey udpated successfully',
      surveyId
    });

  } catch (error) {
    next(error);
  } finally {
    connection.release();
  }
};