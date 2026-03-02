import express from 'express';
import * as surveyController from '../controllers/surveyControllers/index.js';
import { authenticateToken } from '../middlewares/auth.js';
import { upload } from '../middlewares/upload.js';
import { activityLogger } from '../middlewares/activityLogger.js';
import { resizeImages } from '../middlewares/sharp.js';


const router = express.Router();

// GET ALL SURVEYS 
router.get(
  '/', 
  authenticateToken, 
  surveyController.getAllSurveys
);

// GET ALL HOUSEHOLD HEADS
router.get(
  `/householdHeads`,
  authenticateToken,
  surveyController.getAllHouseholdHeads
)

// CREATE SURVEY
router.post(
  '/', 
  authenticateToken, 
  upload.fields([
    { name: 'houseImages', maxCount: 5 },
    { name: 'respondentPhoto', maxCount: 1 },
    { name: 'respondentSignature', maxCount: 1 }
  ]),
  resizeImages,
  activityLogger((req, resData) => 
    `Created survey #${resData.surveyId}`
  ),
  surveyController.createSurvey
);

// GET SURVEY BY ID
router.get('/:surveyId',
  authenticateToken,
  surveyController.getSurveyById
);

// UPDATE SURVEY
router.put('/:surveyId', 
  authenticateToken, 
  upload.fields([
    { name: 'houseImages', maxCount: 5 },
    { name: 'respondentPhoto', maxCount: 1 },
    { name: 'respondentSignature', maxCount: 1 }
  ]),
  activityLogger((req, resData) => 
    `Updated survey #${resData.surveyId}`
  ),
  surveyController.updateSurvey
);

// DELETE SURVEY
router.delete(
  '/', 
  authenticateToken, 
  activityLogger((req, resData) => 
    `Deleted survey #${resData.surveyId}`
  ),
  surveyController.deleteSurvey
);


router.delete(
  '/:surveyId', 
  authenticateToken, 
  activityLogger((req, resData) => 
    `Deleted survey #${resData.surveyId}`
  ),
  surveyController.deleteSurvey
);





export default router; 