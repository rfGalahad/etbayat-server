import { updatePwdIdApplicationService } from '../../services/pwdIdApplicationService/updatePwdIdApplicationService.js';

export const updatePwdIdApplication = async (req, res, next) => {
  try {
    
    const formData = JSON.parse(req.body.formData);
    const pwdId = req.params.pwdId;
    const files = req.files || {};

    await updatePwdIdApplicationService(
      formData,
      pwdId,
      files
    );

    return res.status(200).json({ 
      success: true,
      message: 'Application updated successfully',
      pwdId: pwdId
    });
  } catch (error) {
    next(error)
  } 
};