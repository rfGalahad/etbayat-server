import express from 'express';
import * as authController from '../controllers/authControllers/index.js';
import { authenticateToken } from '../middlewares/auth.js';
import { activityLogger } from '../middlewares/activityLogger.js';

const router = express.Router();

// LOGIN USER
router.post('/login', authController.login);

// FETCH ALL USERS
router.get(
  '/users', 
  authenticateToken, 
  authController.getAllUsers
);

// FETCH LAST SEQUENCE
router.get(
  '/users/last-sequence', 
  authenticateToken, 
  authController.getLastUserSequence
);

// CREATE USER
router.post(
  '/users', 
  authenticateToken,  
  activityLogger(req => 
    `Created user ${req.body.name}`
  ),
  authController.createUser
);

// GENERATE MULTIPLE USERS
router.post(
  '/users/batch', 
  authenticateToken, 
  activityLogger(req => 
    `Generated ${req.body.length} users`
  ),
  authController.createUsersBatch
);

// DELETE USER
router.delete(
  '/users/:userId', 
  authenticateToken, 
  activityLogger((req, resData) => 
    `Deleted user ${resData.userId}`
  ),
  authController.deleteUser
);

// UPDATE USER
router.put(
  '/users/update-profile', 
  authenticateToken, 
  activityLogger((req, resData) => 
    `Updated user ${resData.userId}`
  ),
  authController.updateUserProfile
);

// CHANGE PASSWORD
router.put(
  '/users/change-password/password', 
  authenticateToken, 
  authController.changePassword
);



export default router; 