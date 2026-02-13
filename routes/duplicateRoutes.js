import express from 'express';
import * as duplicateController from '../controllers/duplicateControllers/index.js';
import { authenticateToken } from '../middlewares/auth.js';
import { activityLogger } from '../middlewares/activityLogger.js';

const router = express.Router();

// GET ALL DUPLICATES
router.get(
  '/', 
  authenticateToken, 
  duplicateController.getAllDuplicates
);

router.get(
  '/ignored', 
  authenticateToken, 
  duplicateController.getAllIgnoredDuplicates
);

// IGNORE A DUPLICATE PAIR
router.post(
  '/ignore',  // ← Changed from '/' to '/ignore' to avoid route conflict
  authenticateToken, 
  activityLogger((req, resData) => 
    `Ignored duplicate pair: ${resData.residentId1} and ${resData.residentId2}`
  ),
  duplicateController.ignoreDuplicate
);

// UN-IGNORE A DUPLICATE PAIR (optional)
router.delete(
  '/ignore',
  authenticateToken,
  activityLogger((req, resData) => 
    `Un-ignored duplicate pair: ${resData.residentId1} and ${resData.residentId2}`
  ),
  duplicateController.unignoreDuplicate
);

export default router;