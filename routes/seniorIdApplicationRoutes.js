import express from 'express';
import * as seniorIdApplicationController from '../controllers/seniorIdApplicationControllers/index.js';
import { authenticateToken } from '../middlewares/auth.js';
import { upload } from '../middlewares/upload.js';
import { activityLogger } from '../middlewares/activityLogger.js';
import { resizeImages } from '../middlewares/sharp.js';


const router = express.Router();

// GET ALL SENIOR CITIZEN ID APPLICATIONS 
router.get(
  '/', 
  authenticateToken, 
  seniorIdApplicationController.getAllSeniorIdApplications
);

// CREATE SENIOR CITIZEN ID APPLICATIONS
router.post(
  '/', 
  authenticateToken, 
  upload.fields([
    { name: 'seniorCitizenPhotoId', maxCount: 1 },
    { name: 'seniorCitizenSignature', maxCount: 1 }
  ]),
  resizeImages,
  activityLogger((req, resData) => 
    `Created Solo Parent ID Application #${resData.seniorCitizenId}`
  ),
  seniorIdApplicationController.createSeniorIdApplication
);

// GET APPLCATION BY ID
router.get('/:seniorCitizenId',
  authenticateToken,
  seniorIdApplicationController.getSeniorIdApplicationById
);

// UPDATE SOLO PARENT ID APPLICATION
router.put('/:seniorCitizenId', 
  authenticateToken, 
  upload.fields([
    { name: 'seniorCitizenPhotoId', maxCount: 1 },
    { name: 'seniorCitizenSignature', maxCount: 1 }
  ]),
  activityLogger((req, resData) => 
    `Updated Solo Parent ID Application #${resData.seniorCitizenId}`
  ),
  seniorIdApplicationController.updateSeniorIdApplication
);

// DELETE APPLICATION
router.delete(
  '/:seniorCitizenId', 
  authenticateToken, 
  activityLogger((req, resData) => 
    `Deleted Solo Parent ID Application #${resData.seniorCitizenId}`
  ),
  seniorIdApplicationController.deleteSeniorIdApplication
);





export default router; 