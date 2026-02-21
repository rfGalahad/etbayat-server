import { updateSeniorIdApplicationService } from '../../services/seniorIdApplicationService/updateSeniorIdApplicationService.js';

export const updateSeniorIdApplication = async (req, res, next) => {  
  try {
    const formData = JSON.parse(req.body.formData);
    const seniorCitizenId = req.params.seniorCitizenId;
    const files = req.files || {};
    
    await updateSeniorIdApplicationService(
      formData,
      seniorCitizenId,
      files
    );

    return res.status(200).json({ 
      success: true,
      message: 'Application updated successfully',
      seniorCitizenId: seniorCitizenId
    });
  } catch (error) {
    next(error)
  }
};