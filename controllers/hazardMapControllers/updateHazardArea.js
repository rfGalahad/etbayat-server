import pool from '../../config/db.js';

export const updateHazardArea = async (req, res) => {
  try {
    const { 
      id,
      latitude, 
      longitude, 
      radius, 
      hazardType, 
      description 
    } = req.body;

    await pool.query(`
      UPDATE hazard_areas 
      SET latitude = ?, 
          longitude = ?, 
          radius = ?, 
          hazard_type = ?, 
          description = ? 
      WHERE hazard_area_id = ?`,
      [latitude, longitude, radius, hazardType, description, id]
    );

    res.status(201).json({ 
      message: 'Hazard area created successfully',
      hazardAreaId: res.insertId 
    });
  } catch (error) {
    console.error('Error creating hazard area:', error);
    res.status(500).json({ message: 'Server error' });
  }
};