import pool from '../../config/db.js';

export const getAllHousePins = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        household_id as householdId,
        house_structure as houseStructure,
        house_condition as houseCondition,
        latitude,
        longitude,
        street,
        barangay,
        municipality
      FROM households
    `);

    res.status(200).json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error getting Household:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getAllHouseImages = async (req, res) => {
  try {
    const { householdId } = req.params;

    const [rows] = await pool.query(`
      SELECT 
        house_image_url as houseImageUrl,
        house_image_public_id as houseImagePublicId,
        house_image_title as houseImageTitle
      FROM house_images
      WHERE household_id = ?`,
      [householdId]
    );

    res.status(200).json(rows);
  } catch (error) {
    console.error('Error getting House Images:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getAllHousehold = async (req, res) => {
  try {
    const { householdId } = req.params;

    const [familyRows] = await pool.query(`
      SELECT family_id 
      FROM family_information
      WHERE household_id = ?`,
      [householdId]
    )
 
    const familyId = familyRows[0].family_id;

    const [rows] = await pool.query(`
      SELECT 
        CONCAT(
          first_name, ' ',
          IFNULL(middle_name, ' '),
          last_name, ' ',
          IFNULL(suffix, '')
        ) AS name,
        sex,
        birthdate,
        relation_to_family_head AS relationToFamilyHead
      FROM population
      WHERE family_id   = ?`,
      [familyId]
    );

    res.status(200).json(rows);
  } catch (error) {
    console.error('Error getting House Images:', error);
    res.status(500).json({ message: 'Server error' });
  }
};