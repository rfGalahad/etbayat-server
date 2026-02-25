import express from 'express';
import * as idInformation from '../controllers/idInformationControllers/index.js';
import { authenticateToken } from '../middlewares/auth.js';
import { upload } from '../middlewares/upload.js';
import { activityLogger } from '../middlewares/activityLogger.js';


const router = express.Router();

// GET ALL ID GENERATOR INFORMATION
router.get('/', 
  idInformation.getAllIdInformation
);

// UPDATE ID GENERATOR INFORMATION
router.put('/', 
  authenticateToken, 
  upload.fields([
    { name: 'mayorSignatureFile', maxCount: 1 },
    { name: 'oscaHeadSignatureFile', maxCount: 1 },
    { name: 'mswdoOfficerSignatureFile', maxCount: 1 }
  ]),
  activityLogger((req, resData) => 
    resData.activityLogMessage || 'Updated ID Generator Information'
  ),
  idInformation.updateIdInformation
);



export default router; 