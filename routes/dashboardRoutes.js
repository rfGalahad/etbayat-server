import express from 'express';
import * as dashboardController from '../controllers/dashboardControllers/index.js';
import { authenticateToken } from '../middlewares/auth.js';


const router = express.Router();

// GET ALL STATS
router.get('/stats', 
  authenticateToken, 
  dashboardController.getAllStats
);

// GET POPULATION BY BARANGAY
router.get('/populationByBarangay', 
  authenticateToken, 
  dashboardController.getAllPopulationByBarangay
);


export default router; 