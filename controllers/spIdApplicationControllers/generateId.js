export const generateSoloParentId = async (connection) => {
  
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2); // Last 2 digits of year
  const month = (now.getMonth() + 1).toString().padStart(2, '0'); // Month (01-12)
  const datePrefix = `${month}${year}`;
  
  try {
    // Get the current sequence for today
    const [rows] = await connection.query(
      `SELECT 
      MAX(CAST(SUBSTRING_INDEX(solo_parent_id, '-', -1) AS UNSIGNED)) as maxId 
      FROM solo_parent_id_applications 
      WHERE solo_parent_id LIKE CONCAT('SP-', ?, '-%')`,
      [`${datePrefix}%`]
    );
    
    let sequence = 1;

    if (rows[0].maxId !== null) {
      sequence = rows[0].maxId + 1;
    }
    
    // Format as YYMMDDXXXX where XXXX is the sequence number
    const sequenceStr = sequence.toString().padStart(4, '0');
    const surveyId = `${datePrefix}-${sequenceStr}`;
    
    // Verify this ID doesn't already exist (double-check)
    const [existingCheck] = await connection.query(
      `SELECT COUNT(*) as count FROM solo_parent_id_applications WHERE solo_parent_id = ?`,
      [surveyId]
    );
    
    if (existingCheck[0].count > 0) {
      // In the unlikely event of a collision, recursively try again
      return generateId(connection);
    }
    return surveyId;
  } catch (error) {
    console.error('Error generating Id:', error);
    throw error;
  }
};

export const generateTemporaryResidentId = async (connection) => {
  
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2); // Last 2 digits of year
  const month = (now.getMonth() + 1).toString().padStart(2, '0'); // Month (01-12)
  const datePrefix = `${month}${year}`;
  
  try {
    // Get the current sequence for today
    const [rows] = await connection.query(
      `SELECT 
      MAX(CAST(SUBSTRING_INDEX(resident_id, '-', -1) AS UNSIGNED)) as maxId 
      FROM population 
      WHERE resident_id LIKE CONCAT('T-RID-', ?, '-%')`,
      [`${datePrefix}%`]
    );
    
    let sequence = 1;

    if (rows[0].maxId !== null) {
      sequence = rows[0].maxId + 1;
    }
    
    // Format as YYMMDDXXXX where XXXX is the sequence number
    const sequenceStr = sequence.toString().padStart(4, '0');
    const surveyId = `${datePrefix}-${sequenceStr}`;
    
    // Verify this ID doesn't already exist (double-check)
    const [existingCheck] = await connection.query(
      `SELECT COUNT(*) as count FROM population WHERE resident_id = ?`,
      [surveyId]
    );
    
    if (existingCheck[0].count > 0) {
      // In the unlikely event of a collision, recursively try again
      return generateId(connection);
    }
    return surveyId;
  } catch (error) {
    console.error('Error generating Id:', error);
    throw error;
  }
};