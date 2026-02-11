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

// IGNORE A DUPLICATE PAIR
router.post(
  '/ignore',  // ← Changed from '/' to '/ignore' to avoid route conflict
  authenticateToken, 
  activityLogger((req, resData) => 
    `Ignored duplicate pair: ${req.body.resident_id_1} and ${req.body.resident_id_2}`
  ),
  duplicateController.ignoreDuplicate
);

// UN-IGNORE A DUPLICATE PAIR (optional)
router.delete(
  '/ignore',
  authenticateToken,
  activityLogger((req, resData) => 
    `Un-ignored duplicate pair: ${req.body.resident_id_1} and ${req.body.resident_id_2}`
  ),
  duplicateController.unignoreDuplicate
);

export default router;