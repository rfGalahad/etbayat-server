import pool from '../../config/db.js';
import { getFileUrl } from '../../utils/fileUtils.js';


export const getAllIdInformation = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        mayor_name           AS mayorName,
        mayor_signature      AS mayorSignaturePreview,
        osca_head            AS oscaHeadName,
        osca_head_signature  AS oscaHeadSignaturePreview,
        mswdo_officer        AS mswdoOfficerName,
        mswdo_signature      AS mswdoOfficerSignaturePreview
      FROM id_generator_information`
    );

    const data = {
      mayorName: rows[0]?.mayorName,
      mayorSignaturePreview: getFileUrl(rows[0]?.mayorSignaturePreview, req),
      oscaHeadName: rows[0]?.oscaHeadName,
      oscaHeadSignaturePreview: getFileUrl(rows[0]?.oscaHeadSignaturePreview, req),
      mswdoOfficerName: rows[0]?.mswdoOfficerName,
      mswdoOfficerSignaturePreview: getFileUrl(rows[0]?.mswdoOfficerSignaturePreview, req)
    }

    res.status(200).json({
      success: true,
      data: data
    });
  } catch (error) {
    console.error('Error fetching id information:', error);
    res.status(500).json({ error: 'Failed to fetch id information' });
  }

};