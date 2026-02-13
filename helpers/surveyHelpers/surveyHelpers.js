import { formatDateForMySQL } from "../../utils/dateUtils.js";

export const getNextFamilyId = (latestFamilyId, baseId) => {
  
  if (!latestFamilyId) {
    return `FID-${baseId}-A`;
  }

  const parts = latestFamilyId.split('-');
  const suffix = parts.pop(); // A, B, C...
  const nextSuffix = String.fromCharCode(suffix.charCodeAt(0) + 1);

  return [...parts, nextSuffix].join('-');
}

export const parseFamilyId = (familyId) => {
  const parts = familyId.split('-');
  if (parts.length !== 4) {
    throw new Error(`Invalid family ID: ${familyId}`);
  }

  const [, barangayCode, householdNumber, familyLetter] = parts;

  return {
    barangayCode,
    householdNumber,
    familyLetter,
    residentBaseId:
      `RID-${barangayCode}-${householdNumber}-${familyLetter}`
  };
};

export const generateResidentId = (baseId, seq) => `${baseId}-${seq}`;

const RESIDENT_REF_TABLES = [
  'social_classification',
  'professional_information',
  'contact_information',
  'health_information',
  'government_ids',
  'affiliation',
  'non_ivatan'
];

export const updateResidentReferences = async (
  connection,
  oldId,
  newId
) => {
  for (const table of RESIDENT_REF_TABLES) {
    await connection.query(
      `UPDATE ${table}
       SET resident_id = ?
       WHERE resident_id = ?`,
      [newId, oldId]
    );
  }
};

export const migrateResidentsToNewFamily = async (
  connection,
  oldFamilyId,
  newFamilyId,
  familyProfile,
  residentBaseId
) => {
  const existingResidents = familyProfile.filter(r => r.residentId);
  if (!existingResidents.length) return familyProfile;

  await connection.query('SET FOREIGN_KEY_CHECKS = 0');

  for (const r of existingResidents) {
    const seq = r.residentId.split('-').at(-1);
    const newResidentId = generateResidentId(residentBaseId, seq);

    await updateResidentReferences(
      connection,
      r.residentId,
      newResidentId
    );

    await connection.query(
      `UPDATE population
       SET family_id = ?, resident_id = ?
       WHERE resident_id = ? AND family_id = ?`,
      [newFamilyId, newResidentId, r.residentId, oldFamilyId]
    );

    r.residentId = newResidentId;
  }

  await connection.query('SET FOREIGN_KEY_CHECKS = 1');

  return familyProfile;
};

export const deleteRemovedResidents = async (
  connection,
  familyId,
  residentIds
) => {
  if (residentIds.length) {
    await connection.query(
      `DELETE FROM population
       WHERE family_id = ?
       AND resident_id NOT IN (?)`,
      [familyId, residentIds]
    );
  } else {
    await connection.query(
      `DELETE FROM population
       WHERE family_id = ?`,
      [familyId]
    );
  }
};

export const getNextResidentSequence = async (
  connection,
  familyId
) => {
  const [rows] = await connection.query(
    `SELECT MAX(
      CAST(SUBSTRING_INDEX(resident_id, '-', -1) AS UNSIGNED)
    ) AS maxNum
     FROM population
     WHERE family_id = ?`,
    [familyId]
  );

  return (rows[0]?.maxNum || 0) + 1;
};

export const upsertPopulation = async (
  connection,
  familyId,
  familyProfile
) => {
  const values = familyProfile.map(r => [
    r.residentId,
    familyId,
    r.firstName.trim(),
    r.middleName?.trim() || null,
    r.lastName.trim(),
    r.suffix || null,
    r.sex,
    formatDateForMySQL(r.birthdate),
    r.verifiedBirthdate,
    r.specifyId,
    r.civilStatus,
    r.religion,
    r.relationToFamilyHead,
    r.otherRelationship || null,
    r.birthplace
  ]);

  await connection.query(
    `INSERT INTO population (
      resident_id,
      family_id,
      first_name,
      middle_name,
      last_name,
      suffix,
      sex,
      birthdate,
      verified_birthdate,
      specify_id,
      civil_status,
      religion,
      relation_to_family_head,
      other_relationship,
      birthplace
    )
    VALUES ?
    ON DUPLICATE KEY UPDATE
      first_name = VALUES(first_name),
      middle_name = VALUES(middle_name),
      last_name = VALUES(last_name),
      suffix = VALUES(suffix),
      sex = VALUES(sex),
      birthdate = VALUES(birthdate),
      verified_birthdate = VALUES(verified_birthdate),
      specify_id = VALUES(specify_id),
      civil_status = VALUES(civil_status),
      religion = VALUES(religion),
      relation_to_family_head = VALUES(relation_to_family_head),
      other_relationship = VALUES(other_relationship),
      birthplace = VALUES(birthplace)`,
    [values]
  );
};

export const findExistingFamilyHead = async (
  connection, 
  { 
    firstName, 
    middleName, 
    lastName, 
    suffix 
  }
) => {
  const [results] = await connection.query(`
    SELECT p.family_id, f.household_id
    FROM population p
    JOIN family_information f ON f.family_id = p.family_id
    WHERE p.first_name = ?
      AND (p.middle_name <=> ?)
      AND p.last_name = ?
      AND (p.suffix <=> ?)
      AND p.relation_to_family_head = 'Family Head'
    LIMIT 1
  `, [firstName, middleName, lastName, suffix]);

  return results[0] || null;
}

export const generateNextFamilyId = async (
  connection, 
  householdId
) => {
  const [latestFamily] = await connection.query(`
    SELECT family_id
    FROM family_information
    WHERE household_id = ?
    ORDER BY family_id DESC
    LIMIT 1
  `, [householdId]);

  // Extract household number from household_id (HID-0126-0001 → 0001)
  const householdParts = householdId.split('-');
  const barangayCode = householdParts[1]; // 0126
  const householdNumber = householdParts[2]; // 0001

  let nextLetter = 'A';

  if (latestFamily[0]?.family_id) {
    // Extract letter from latest family_id (FID-0126-0001-B → B)
    const familyParts = latestFamily[0].family_id.split('-');
    const currentLetter = familyParts[3] || 'A';
    
    // Get next letter (A→B, B→C, etc.)
    nextLetter = String.fromCharCode(currentLetter.charCodeAt(0) + 1);
  }

  const newFamilyId = `FID-${barangayCode}-${householdNumber}-${nextLetter}`;

  return newFamilyId;
}


