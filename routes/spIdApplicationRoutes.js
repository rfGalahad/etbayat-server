import express from 'express';
import * as spIdApplicationController from '../controllers/spIdApplicationControllers/index.js';
import { authenticateToken } from '../middlewares/auth.js';
import { upload } from '../middlewares/upload.js';
import { activityLogger } from '../middlewares/activityLogger.js';
import { resizeImages } from '../middlewares/sharp.js';


const router = express.Router();

// GET ALL SOLO PARENT ID APPLICATIONS 
router.get(
  '/', 
  authenticateToken, 
  spIdApplicationController.getAllSpIdApplications
);

// CREATE SOLO PARENT ID APPLICATIONS
router.post(
  '/', 
  authenticateToken, 
  upload.fields([
    { name: 'soloParentPhotoId', maxCount: 1 },
    { name: 'soloParentSignature', maxCount: 1 }
  ]),
  resizeImages,
  activityLogger((req, resData) => 
    `Created Solo Parent ID Application #${resData.soloParentId}`
  ),
  spIdApplicationController.createSpIdApplication
);

// GET RESIDENT INFORMATION
router.get('/resident/:residentId',
  authenticateToken,
  spIdApplicationController.getResidentInfo
);

// GET APPLCATION BY ID
router.get('/:soloParentId',
  authenticateToken,
  spIdApplicationController.getSpIdApplicationById
);

// UPDATE SOLO PARENT ID APPLICATION
router.put('/:soloParentId', 
  authenticateToken, 
  upload.fields([
    { name: 'soloParentPhotoId', maxCount: 1 },
    { name: 'soloParentSignature', maxCount: 1 }
  ]),
  activityLogger((req, resData) => 
    `Updated Solo Parent ID Application #${resData.soloParentId}`
  ),
  spIdApplicationController.updateSpIdApplication
);

// DELETE APPLICATION
router.delete(
  '/:soloParentId', 
  authenticateToken, 
  activityLogger((req, resData) => 
    `Deleted Solo Parent ID Application #${resData.soloParentId}`
  ),
  spIdApplicationController.deleteSpIdApplication
);





export default router; 