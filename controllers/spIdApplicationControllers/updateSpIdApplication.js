import { updateSpIdApplicationService } from '../../services/spIdApplicationService/updateSpIdApplicationService.js';

export const updateSpIdApplication = async (req, res, next) => {
  try {
    const formData = JSON.parse(req.body.formData);
    const soloParentId = req.params.soloParentId;
    const files = req.files || {};

    await updateSpIdApplicationService(
      formData,
      soloParentId,
      files
    );

    return res.status(200).json({ 
      success: true,
      message: 'Application updated successfully',
      soloParentId: soloParentId
    });
  } catch (error) {
    next(error);
  } 
};