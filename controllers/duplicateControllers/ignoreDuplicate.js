import pool from '../../config/db.js';

export const ignoreDuplicate = async (req, res) => {
  let { resident_id_1, resident_id_2, reason } = req.body;
  
  // Ensure smaller ID is always first
  if (resident_id_1 > resident_id_2) {
    [resident_id_1, resident_id_2] = [resident_id_2, resident_id_1];
  }
  
  try {
    await pool.query(`
      INSERT INTO ignored_duplicates (resident_id_1, resident_id_2, reason)
      VALUES (?, ?, ?)
    `, [resident_id_1, resident_id_2, reason]);
    
    res.status(200).json({ 
      success: true, 
      message: 'Duplicate ignored' 
    });
  } catch (error) {
    console.error(error)
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};