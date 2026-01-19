import db from '../../config/db.js';


export const getLastUserSequence = async (req, res) => {
  try {
    const { dateFormat } = req.query;
    
    if (!dateFormat) {
      return res.status(400).json({ error: 'dateFormat is required' });
    }

    const [rows] = await db.query(
      `SELECT
        MAX(CAST(SUBSTRING_INDEX(user_id, '-', -1) AS UNSIGNED)) AS lastUserIDSequence 
       FROM users 
       WHERE user_id LIKE CONCAT('UID-', ?, '-%')`,
      [dateFormat]
    );
    
    const lastSequence = rows[0].lastUserIDSequence || 0;

    return res.status(200).json({ lastSequence });
  } catch (error) {
    console.error('Error getting last sequence:', error);
    return res.status(500).json({ 
      error: 'Error getting last sequence', 
      details: error.message 
    });
  }
};