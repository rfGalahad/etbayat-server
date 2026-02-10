import pool from '../../config/db.js';

export const deletePwdIdApplication = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const { pwdId } = req.params;

    await connection.beginTransaction();

    // GET RESIDENT ID
    const [rows] = await connection.query(`
      SELECT resident_id AS residentId
      FROM pwd_id_applications
      WHERE pwd_id = ?`,
      [pwdId]
    );

    if (!rows.length) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: 'PWD ID application not found'
      });
    }

    const residentId = rows[0].residentId;

    // DELETE RELATED RECORDS ONLY IF TEMPORARY RESIDENT
    if (residentId?.startsWith('T-RID')) {
      await connection.query(
        `DELETE FROM population WHERE resident_id = ?`,
        [residentId]
      );
      await connection.query(
        `DELETE FROM professional_information WHERE resident_id = ?`,
        [residentId]
      );
      await connection.query(
        `DELETE FROM contact_information WHERE resident_id = ?`,
        [residentId]
      );
      await connection.query(
        `DELETE FROM health_information WHERE resident_id = ?`,
        [residentId]
      );
      await connection.query(
        `DELETE FROM government_ids WHERE resident_id = ?`,
        [residentId]
      );
    }

    // DELETE PWD ID APPLICATION
    await connection.query(
      `DELETE FROM pwd_id_applications WHERE pwd_id = ?`,
      [pwdId]
    );

    await connection.commit();

    return res.status(200).json({
      success: true,
      message: 'Application deleted successfully',
      pwdId
    });

  } catch (error) {
    await connection.rollback();
    console.error('Error deleting application:', error);

    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  } finally {
    connection.release();
  }
};
