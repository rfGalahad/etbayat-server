import pool from '../../config/db.js';

export const createHazardArea = async (req, res) => {
  try {
    const { 
      latitude, 
      longitude, 
      radius, 
      hazardType, 
      description 
    } = req.body;

    const [result] = await pool.query(`
      INSERT INTO hazard_areas (
        latitude, 
        longitude, 
        radius, 
        hazard_type, 
        description
      ) VALUES (?, ?, ?, ?, ?)`,
      [
        latitude, 
        longitude, 
        radius, 
        hazardType, 
        description
      ]
    );

    res.status(201).json({ 
      message: 'Hazard area created successfully',
      hazardAreaId: result.insertId 
    });
  } catch (error) {
    console.error('Error creating hazard area:', error);
    res.status(500).json({ message: 'Server error' });
  }
};