import express from 'express';
import * as activityLogControllers from '../controllers/activityLogControllers/index.js';

const router = express.Router();

router.get('/', activityLogControllers.getAllActivityLogs);
router.delete('/:activityLogID', activityLogControllers.deleteActivityLog);

export default router;