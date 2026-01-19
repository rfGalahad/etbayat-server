import pool from '../../config/db.js';

export const deleteActivityLog = async (req, res) => {

  const activityLogID = req.params.activityLogID;

  try {
    await pool.query(
      `DELETE FROM activity_log WHERE activity_log_id = ?`,
      [activityLogID]);

    res.status(200).json({ 
      success: true, 
      message: 'Activity deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting activity:', error);
    res.status(500).json({ message: 'Server error' });
  }
};