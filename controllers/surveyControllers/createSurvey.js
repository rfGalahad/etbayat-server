import { createSurveyService } from "../../services/surveyService/createSurveyService.js";

export const createSurvey = async (req, res, next) => {
  try {
    const formData = JSON.parse(req.body.formData);
    const userId = req.user.userId;
    const files = req.files || {};
    
    const surveyId = await createSurveyService(
      formData, 
      userId, 
      files
    );

    return res.status(201).json({ 
      success: true,
      message: 'Survey created successfully',
      surveyId: surveyId
    });
  } catch (error) {
    next(error);
  }
};