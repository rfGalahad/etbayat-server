export const generateSurveyId = async (connection) => {
  
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2); // Last 2 digits of year
  const month = (now.getMonth() + 1).toString().padStart(2, '0'); // Month (01-12)
  const datePrefix = `${month}${year}`;
  
  try {
    // Get the current sequence for today
    const [rows] = await connection.query(
      `SELECT 
      MAX(CAST(SUBSTRING_INDEX(survey_id, '-', -1) AS UNSIGNED)) as maxId 
      FROM surveys 
      WHERE survey_id LIKE CONCAT('SID-', ?, '-%')`,
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
      `SELECT COUNT(*) as count FROM surveys WHERE survey_id = ?`,
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

export const generateHouseholdId = async (connection) => {
  
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2); // Last 2 digits of year
  const month = (now.getMonth() + 1).toString().padStart(2, '0'); // Month (01-12)
  const datePrefix = `${month}${year}`;
  
  try {
    // Get the current sequence for today
    const [rows] = await connection.query(
      `SELECT 
      MAX(CAST(SUBSTRING_INDEX(household_id, '-', -1) AS UNSIGNED)) as maxId 
      FROM households 
      WHERE household_id LIKE CONCAT('HID-', ?, '-%')`,
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
      `SELECT COUNT(*) as count FROM households WHERE household_id = ?`,
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