import pool from '../../config/db.js';
import { saveToLocal } from '../../utils/fileUtils.js';

export const updateIdInformation = async (req, res) => {
  try {
    const { mayorName, oscaHeadName, mswdoOfficerName } = req.body;

    let mayorSignature = null;
    let oscaHeadSignature = null;
    let mswdoOfficerSignature = null;

    const changes = [];

    if (req.files?.mayorSignatureFile?.[0]) {
      const file = req.files.mayorSignatureFile[0];
      mayorSignature = await saveToLocal(
        file.buffer,
        "id_generator_information",
        "Mayor Signature",
        file.mimetype
      );
      changes.push("Mayor's Signature");
    }

    if (req.files?.oscaHeadSignatureFile?.[0]) {
      const file = req.files.oscaHeadSignatureFile[0];
      oscaHeadSignature = await saveToLocal(
        file.buffer,
        "id_generator_information",
        "OSCA Head's Signature",
        file.mimetype
      );
      changes.push("OSCA Head's Signature");
    }

    if (req.files?.mswdoOfficerSignatureFile?.[0]) {
      const file = req.files.mswdoOfficerSignatureFile[0];
      mswdoOfficerSignature = await saveToLocal(
        file.buffer,
        "id_generator_information",
        "MSWDO Officer Signature",
        file.mimetype
      );
      changes.push("MSWDO Officer's Signature");
    }

    const updates = [];
    const values = [];

    if (mayorName !== undefined) {
      updates.push("mayor_name = ?");
      values.push(mayorName);
      changes.push("Mayor's Name");
    }

    if (mayorSignature) {
      updates.push("mayor_signature = ?");
      values.push(mayorSignature.url);
    }

    if (oscaHeadName !== undefined) {
      updates.push("osca_head_name = ?");
      values.push(oscaHeadName);
      changes.push("OSCA Head's Name");
    }

    if (oscaHeadSignature) {
      updates.push("osca_head_signature = ?");
      values.push(oscaHeadSignature.url);
    }

    if (mswdoOfficerName !== undefined) {
      updates.push("mswdo_officer_name = ?");
      values.push(mswdoOfficerName);
      changes.push("MSWDO Officer's Name");
    }

    if (mswdoOfficerSignature) {
      updates.push("mswdo_officer_signature = ?");
      values.push(mswdoOfficerSignature.url);
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: "No changes provided" });
    }

    await pool.query(
      `UPDATE id_generator_information
       SET ${updates.join(", ")}
       WHERE id = 1`,
      values
    );

    const actitivityLogMessage = `Updated ${changes.join(" and ")}`;

    res.status(200).json({
      success: true,
      message: "Updated successfully",
      actitivityLogMessage
    });

  } catch (error) {
    console.error("Error updating signatory information:", error);
    res.status(500).json({ message: "Server error" });
  }
};