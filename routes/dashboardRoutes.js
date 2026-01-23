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
router.get('/population', 
  authenticateToken, 
  dashboardController.getAllPopulation
);

// GET FEMALE AGE SEGREGATION
router.get('/ageSegregation/female', 
  authenticateToken, 
  dashboardController.getFemaleAgeSegregation
);

// GET MALE AGE SEGREGATION
router.get('/ageSegregation/male', 
  authenticateToken, 
  dashboardController.getMaleAgeSegregation
);

// GET SOLO PARENT
router.get('/soloParent', 
  authenticateToken, 
  dashboardController.getAllSoloParent
);

// GET ALL PWD
router.get('/pwd', 
  authenticateToken, 
  dashboardController.getAllPwd
);

// GET ALL SENIOR CITIZEN
router.get('/seniorCitizen', 
  authenticateToken, 
  dashboardController.getAllSeniorCitizen
);

// GET ALL NON-IVATAN / IPULA
router.get('/nonIvatan', 
  authenticateToken, 
  dashboardController.getAllNonIvatan
);

// GET ALL HOUSEHOLD STRUCTURE
router.get('/householdStructure', 
  authenticateToken, 
  dashboardController.getAllHouseholdStructure
);

// GET ALL HOUSEHOLD CONDITION
router.get('/householdCondition', 
  authenticateToken, 
  dashboardController.getAllHouseholdCondition
);

// GET ALL WATER SOURCES
router.get('/waterSources', 
  authenticateToken, 
  dashboardController.getAllWaterSources
);

// GET ALL WATER ACCESS / POTABLE WATER
router.get('/waterAccess', 
  authenticateToken, 
  dashboardController.getAllWaterAccess
);

// GET ALL OFW
router.get('/ofw', 
  authenticateToken, 
  dashboardController.getAllOfw
);

// GET ALL OUT OF TOWN
router.get('/outOfTown', 
  authenticateToken, 
  dashboardController.getAllOutOfTown
);

export default router; 