import pool from '../../config/db.js';


export const updateFamilyClass = async (req, res) => {
  try {    
    const familyId = req.params.familyId;
    const { familyClass } = req.body;

    await pool.query(
      `UPDATE family_information 
      SET family_class = ?
      WHERE family_id = ?`,
      [ 
        familyClass,
        familyId
      ]
    );
    
    res.status(200).json({ 
      success: true, 
      message: 'Family class updated successfully',
      familyClass: familyClass,
      familyId: familyId
    });
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({ message: 'Server error' });
  }
};