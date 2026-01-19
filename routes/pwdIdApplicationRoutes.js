import express from 'express';
import * as pwdIdApplicationController from '../controllers/pwdIdApplicationControllers/index.js';
import { authenticateToken } from '../middlewares/auth.js';
import { upload } from '../middlewares/upload.js';
import { activityLogger } from '../middlewares/activityLogger.js';
import { resizeImages } from '../middlewares/sharp.js';


const router = express.Router();

// GET ALL PWD ID APPLICATIONS 
router.get(
  '/', 
  authenticateToken, 
  pwdIdApplicationController.getAllPwdIdApplications
);

// CREATE PWD ID APPLICATIONS
router.post(
  '/', 
  authenticateToken, 
  upload.fields([
    { name: 'pwdPhotoId', maxCount: 1 },
    { name: 'pwdSignature', maxCount: 1 }
  ]),
  resizeImages,
  activityLogger((req, resData) => 
    `Created PWD ID Application #${resData.pwdId}`
  ),
  pwdIdApplicationController.createPwdIdApplication
);

// GET PWD ID APPLICATION BY ID
router.get('/:pwdId',
  authenticateToken,
  pwdIdApplicationController.getPwdIdApplicationById
);

// UPDATE SURVEY
router.put('/:pwdId', 
  authenticateToken, 
  upload.fields([
    { name: 'pwdPhotoId', maxCount: 1 },
    { name: 'pwdSignature', maxCount: 1 }
  ]),
  activityLogger((req, resData) => 
    `Updated survey #${resData.surveyId}`
  ),
  pwdIdApplicationController.updatePwdIdApplication
);

// DELETE SURVEY
router.delete(
  '/:pwdId', 
  authenticateToken, 
  activityLogger((req, resData) => 
    `Deleted PWD ID Application #${resData.pwdId}`
  ),
  pwdIdApplicationController.deletePwdIdApplication
);





export default router; 