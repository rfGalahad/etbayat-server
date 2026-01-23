import express from 'express';
import * as hazardMapController from '../controllers/hazardMapControllers/index.js';
import { authenticateToken } from '../middlewares/auth.js';
import { activityLogger } from '../middlewares/activityLogger.js';


const router = express.Router();

// GET ALL HOUSE PINS
router.get('/housePins',
  authenticateToken,
  hazardMapController.getAllHousePins
)

// GET ALL HOUSE IMAGES
router.get('/houseImages/:householdId',
  authenticateToken,
  hazardMapController.getAllHouseImages
)

// GET ALL HOUSEHOLD
router.get('/household/:householdId',
  authenticateToken,
  hazardMapController.getAllHousehold
)

// GET ALL HAZARD AREA
router.get('/', 
  authenticateToken, 
  hazardMapController.getAllHazardAreas
);

// CREATE A HAZARD AREA
router.post('/', 
  authenticateToken, 
  activityLogger((req, resData) => 
    `Created hazard area //`
  ),
  hazardMapController.createHazardArea
);

// UPDATE HAZARD AREA
router.put('/:hazardAreaId', 
  authenticateToken, 
  activityLogger((req, resData) => 
    `Updated hazard area //`
  ),
  hazardMapController.updateHazardArea
);

// DELETE HAZARD AREA
router.delete('/:hazardAreaId', 
  authenticateToken, 
  activityLogger((req, resData) => 
    `Deleted hazard area //`
  ),
  hazardMapController.deleteHazardArea
);


export default router; 