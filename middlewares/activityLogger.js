import pool from '../config/db.js';

/**
 * Activity Logger Middleware
 * Logs user activities to the activity_log table
 * 
 * @param {Function} getDescription - Function that returns activity description
 * @returns {Function} Express middleware function
 * 
 * @example
 * activityLogger(req => `Created User ${req.body.username}`)
 * activityLogger((req, res) => `Deleted User ${res.deletedUsername}`)
 */
export const activityLogger = (getDescription) => {
  return async (req, res, next) => {
    // Store original json method
    const originalJson = res.json.bind(res);
    
    // Override res.json to capture response
    res.json = function(data) {
      // Only log if response is successful (2xx status codes)
      if (res.statusCode >= 200 && res.statusCode < 300) {
        logActivity(req, getDescription, data).catch(err => {
          console.error('Activity logging error:', err);
        });
      }
      
      // Call original json method
      return originalJson(data);
    };
    
    next();
  };
};

/**
 * Log activity to database
 * @param {Object} req - Express request object
 * @param {Function} getDescription - Function to generate description
 * @param {Object} responseData - Response data
 */
async function logActivity(req, getDescription, responseData) {
  try {
    const userID = req.user?.userId;
    
    if (!userID) {
      console.warn('Activity log skipped: No user ID found');
      return;
    }
    
    // Generate description using the provided function
    // Pass both req and responseData to allow access to response information
    const description = typeof getDescription === 'function' 
      ? getDescription(req, responseData) 
      : String(getDescription);
    
    if (!description || description.trim() === '') {
      console.warn('Activity log skipped: Empty description');
      return;
    }
    
    // Insert into activity_log table
    const query = `
      INSERT INTO activity_log (user_id, description, created_at)
      VALUES (?, ?, NOW())
    `;
    
    await pool.query(query, [userID, description]);
  } catch (error) {
    console.error('Failed to log activity:', error);
    // Don't throw - logging failure shouldn't break the request
  }
}