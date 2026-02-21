import express from 'express';
import * as activityLogControllers from '../controllers/activityLogControllers/index.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = express.Router();

router.get(
  '/', 
  authenticateToken,
  activityLogControllers.getAllActivityLogs
);

router.delete(
  '/:activityLogID', 
  activityLogControllers.deleteActivityLog
);

export default router;