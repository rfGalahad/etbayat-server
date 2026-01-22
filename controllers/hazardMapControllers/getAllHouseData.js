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

    // Get all family IDs for this household
    const [familyRows] = await pool.query(`
      SELECT family_id 
      FROM family_information
      WHERE household_id = ?`,
      [householdId]
    );

    // If no families found, return empty array
    if (familyRows.length === 0) {
      return res.status(200).json([]);
    }

    // Extract all family IDs
    const familyIds = familyRows.map(row => row.family_id);

    // Get all population members for all families in this household
    const [rows] = await pool.query(`
      SELECT 
        p.resident_id AS residentId,
        p.family_id AS familyId,
        CONCAT(
          p.first_name, ' ',
          IFNULL(CONCAT(p.middle_name, ' '), ''),
          p.last_name,
          IFNULL(CONCAT(' ', p.suffix), '')
        ) AS name,
        p.sex,
        p.birthdate,
        p.civil_status AS civilStatus,
        p.religion,
        p.relation_to_family_head AS relationToFamilyHead,
        p.birthplace,
        fi.family_class AS familyClass,
        fi.monthly_income AS monthlyIncome,
        fi.irregular_income AS irregularIncome,
        fi.family_income AS familyIncome
      FROM population p
      INNER JOIN family_information fi ON p.family_id = fi.family_id
      WHERE p.family_id IN (?)
      ORDER BY 
        p.family_id,
        CASE WHEN p.relation_to_family_head = 'Family Head' THEN 0 ELSE 1 END,
        p.first_name`,
      [familyIds]
    );

    res.status(200).json(rows);
  } catch (error) {
    console.error('Error getting household members:', error);
    res.status(500).json({ message: 'Server error' });
  }
};