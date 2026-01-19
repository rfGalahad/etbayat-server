import pool from '../../config/db.js';


export const getAllHazardAreas = async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT * FROM hazard_areas`);
    
    res.json(rows);
  } catch (error) {
    console.error('Error fetching hazard areas:', error);
    res.status(500).json({ error: 'Failed to fetch hazard areas' });
  }

};