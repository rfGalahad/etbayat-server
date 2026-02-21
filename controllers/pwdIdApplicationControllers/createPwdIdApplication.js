import { createPwdIdApplicationService } from '../../services/pwdIdApplicationService/createPwdIdApplicationService.js';

export const createPwdIdApplication = async (req, res, next) => {
  try {
    const formData = JSON.parse(req.body.formData);
    const userId = req.user.userId;
    const files = req.files || {};

    const pwdId = await createPwdIdApplicationService(
      formData,
      userId,
      files
    )

    res.status(201).json({ 
      success: true,
      message: 'Application created successfully',
      pwdId: pwdId
    });
  } catch (error) {
    next(error);
  }
};