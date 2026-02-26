import express from 'express';
import { printId } from '../controllers/printIdControllers/printId.js';
import { authenticateToken } from '../middlewares/auth.js';
import { activityLogger } from '../middlewares/activityLogger.js';


const router = express.Router();

// PRINT ID
router.post('/', 
  authenticateToken, 
  activityLogger((req, resData) => `Printed Id`),
  printId
);


export default router; 