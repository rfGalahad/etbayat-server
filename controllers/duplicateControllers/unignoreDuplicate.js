import pool from '../../config/db.js';

export const unignoreDuplicate = async (req, res) => {
  let { resident_id_1, resident_id_2 } = req.body;
  
  // Ensure smaller ID is always first
  if (resident_id_1 > resident_id_2) {
    [resident_id_1, resident_id_2] = [resident_id_2, resident_id_1];
  }
  
  try {
    const [result] = await pool.query(`
      DELETE FROM ignored_duplicates
      WHERE resident_id_1 = ? AND resident_id_2 = ?
    `, [resident_id_1, resident_id_2]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Ignored duplicate pair not found' 
      });
    }
    
    res.status(200).json({ 
      success: true, 
      message: 'Duplicate pair un-ignored successfully' 
    });
  } catch (error) {
    console.error('Error un-ignoring duplicate:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error un-ignoring duplicate',
      error: error.message 
    });
  }
};
