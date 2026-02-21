import { createSpIdApplicationService } from '../../services/spIdApplicationService/createSpIdApplicationService.js';


export const createSpIdApplication = async (req, res, next) => {
  try {
    const formData = JSON.parse(req.body.formData);
    const userId = req.user.userId;
    const files = req.files || {};
    
    const soloParentId = await createSpIdApplicationService(
      formData,
      userId,
      files
    );  

    res.status(201).json({ 
      success: true,
      message: 'Application created successfully',
      soloParentId: soloParentId
    });
  } catch (error) {
    next(error)
  } 
};