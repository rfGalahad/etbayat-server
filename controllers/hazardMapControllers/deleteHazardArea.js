import pool from '../../config/db.js';

export const deleteHazardArea = async (req, res) => {
  try {
    const { hazardAreaId } = req.params;
    
    await pool.query(`
      DELETE FROM hazard_areas 
      WHERE hazard_area_id = ?`, 
      [hazardAreaId]
    );
    
    return res.status(200).json({ 
      success: true,
      message: 'Hazard area deleted succesfully',
      hazardAreaId: hazardAreaId
    });
  } catch (error) {
    console.error('Error deleting hazard area:', error);
    res.status(500).json({ error: 'Failed to delete hazard area' });
  }
};