import express from 'express';
import * as backupController from '../controllers/backupControllers/backup.js';
import { authenticateToken } from '../middlewares/auth.js';
import { activityLogger } from '../middlewares/activityLogger.js';
import { upload } from '../middlewares/upload.js';

const router = express.Router();

router.post(
  '/', 
  authenticateToken, 
  activityLogger(req => 
    `Created backup`
  ),
  backupController.backup
);

router.post(
  '/restore', 
  authenticateToken,
  upload.single('sqlFile'), 
  backupController.restore
);

router.get(
  '/download/:filename',
  authenticateToken,
  backupController.download
)

router.get(
  '/', 
  authenticateToken,
  backupController.listBackups
);           

router.delete(
  '/:filename', 
  authenticateToken,
  backupController.removeBackup
);

router.delete(
  '/', 
  authenticateToken,
  backupController.removeAllBackups
);

export default router;