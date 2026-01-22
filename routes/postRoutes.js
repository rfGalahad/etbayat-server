import express from 'express';
import * as postController from '../controllers/postControllers/index.js';
import { authenticateToken } from '../middlewares/auth.js';
import { upload } from '../middlewares/upload.js';
import { activityLogger } from '../middlewares/activityLogger.js';


const router = express.Router();

// CREATE A POST
router.post('/', 
  authenticateToken, 
  upload.single('postThumbnail'),
  activityLogger((req, resData) => 
    `Created post titled "${resData.post_title}"`
  ),
  postController.createPost
);

// GET ALL POSTS
router.get('/', 
  postController.getAllPosts
);

// GET POST BY ID
router.get('/:postId', 
  authenticateToken, 
  postController.getPostById
);

// UPDATE POST
router.put('/:postId', 
  authenticateToken, 
  upload.single('postThumbnail'),
  activityLogger((req, resData) => 
    `Updated post titled "${resData.post_title}"`
  ),
  postController.updatePost
);

router.delete(
  '/:postId', 
  authenticateToken, 
  activityLogger((req, resData) => 
    `Deleted post titled "${resData.post_title}"`
  ),
  postController.deletePost
);



export default router; 