import { createSeniorIdApplicationService } from '../../services/seniorIdApplicationService/createSeniorIdApplicationService.js';


export const createSeniorIdApplication = async (req, res, next) => {
  try {
    const formData = JSON.parse(req.body.formData);
    const userId = req.user.userId;
    const files = req.files || {};

    const seniorCitizenId = await createSeniorIdApplicationService(
      formData,
      userId,
      files
    );

    res.status(201).json({ 
      success: true,
      message: 'Application created successfully',
      seniorCitizenId: seniorCitizenId
    });
  } catch (error) {
    next(error)
  }
};