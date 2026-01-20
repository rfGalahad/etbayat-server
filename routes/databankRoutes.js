import express from 'express';
import * as databankController from '../controllers/databankControllers/index.js';
import { authenticateToken } from '../middlewares/auth.js';


const router = express.Router();

// GET POPULATION
router.get('/population', 
  authenticateToken, 
  databankController.getPopulation
);

// GET HOUSEHOLD
router.get('/household', 
  authenticateToken, 
  databankController.getHousehold
);

// GET FAMILY
router.get('/family', 
  authenticateToken, 
  databankController.getFamily
);

// GET SOLO PARENT
router.get('/soloParent', 
  authenticateToken, 
  databankController.getSoloParent
);

// GET PWD
router.get('/pwd', 
  authenticateToken, 
  databankController.getPwd
);



export default router; 