import pool from '../../config/db.js';

export const getWomenMasterlist = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      
    `);
    
    res.status(200).json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error fetching women masterlist data:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching women masterlist data', 
      error: error.message 
    });
  }
}


