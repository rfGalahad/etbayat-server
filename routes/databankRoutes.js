import express from 'express';
import * as databankController from '../controllers/databankControllers/index.js';
import { authenticateToken } from '../middlewares/auth.js';


const router = express.Router();

// GET POPULATION
router.get('/population', 
  authenticateToken, 
  databankController.getPopulation
);

// GET FEMALE AGE SEGREGATION
router.get('/age-segregation/female', 
  authenticateToken, 
  databankController.getFemaleSegregation
);

// GET MALE AGE SEGREGATION
router.get('/age-segregation/male', 
  authenticateToken, 
  databankController.getMaleSegregation
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


// GET WOMEN MASTERLIST
router.get('/masterlist/women', 
  authenticateToken, 
  databankController.getWomenMasterlist
);

// GET MEN MASTERLIST
router.get('/masterlist/men', 
  authenticateToken, 
  databankController.getMenMasterlist
);

// GET SENIOR CITIZEN MASTERLIST
router.get('/masterlist/seniorCitizen', 
  authenticateToken, 
  databankController.getSeniorCitizenMasterlist
);

// GET NON-IVATAN MASTERLIST
router.get('/masterlist/nonIvatan', 
  authenticateToken, 
  databankController.getNonIvatanMasterlist
);

// GET OFW MASTERLIST
router.get('/masterlist/ofw', 
  authenticateToken, 
  databankController.getOfwMasterlist
);

// GET OUT-OF-TOWN MASTERLIST
router.get('/masterlist/outOfTown', 
  authenticateToken, 
  databankController.getOutOfTownMasterlist
);


// GET RESIDENT INFO BY ID
router.get('/resident/:residentId',
  authenticateToken,
  databankController.getResidentInfoById
);





export default router; 