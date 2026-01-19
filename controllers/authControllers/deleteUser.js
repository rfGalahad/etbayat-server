import db from '../../config/db.js';



export const deleteUser = async (req, res) => {
  
  const connection = await db.getConnection();
  const userId = req.params.userId;

  try {
    await connection.query(`
      DELETE FROM users WHERE user_id = ?`, 
      [userId]
    );
  
    res.status(200).json({ 
      success: true, 
      message: 'User deleted successfully',
      userId: userId
    });
  } catch (error) {
    console.error('Error deleting User:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting User', 
      error: error.message 
    });
  } finally {
    connection.release();
  }
};