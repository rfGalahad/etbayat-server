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

    const fields = ["id"];
    const placeholders = ["?"];
    const insertValues = [1];

    const updateClause = [];

    if (mayorName !== undefined) {
      fields.push("mayor_name");
      placeholders.push("?");
      insertValues.push(mayorName);
      updateClause.push("mayor_name = VALUES(mayor_name)");
      changes.push("Mayor's Name");
    }

    if (mayorSignature) {
      fields.push("mayor_signature");
      placeholders.push("?");
      insertValues.push(mayorSignature.url);
      updateClause.push("mayor_signature = VALUES(mayor_signature)");
    }

    if (oscaHeadName !== undefined) {
      fields.push("osca_head");
      placeholders.push("?");
      insertValues.push(oscaHeadName);
      updateClause.push("osca_head = VALUES(osca_head)");
      changes.push("OSCA Head's Name");
    }

    if (oscaHeadSignature) {
      fields.push("osca_head_signature");
      placeholders.push("?");
      insertValues.push(oscaHeadSignature.url);
      updateClause.push("osca_head_signature = VALUES(osca_head_signature)");
    }

    if (mswdoOfficerName !== undefined) {
      fields.push("mswdo_officer");
      placeholders.push("?");
      insertValues.push(mswdoOfficerName);
      updateClause.push("mswdo_officer = VALUES(mswdo_officer)");
      changes.push("MSWDO Officer's Name");
    }

    if (mswdoOfficerSignature) {
      fields.push("mswdo_signature");
      placeholders.push("?");
      insertValues.push(mswdoOfficerSignature.url);
      updateClause.push("mswdo_signature = VALUES(mswdo_signature)");
    }

    if (fields.length === 1) {
      return res.status(400).json({ message: "No changes provided" });
    }

    await pool.query(
      `
      INSERT INTO id_generator_information (${fields.join(", ")})
      VALUES (${placeholders.join(", ")})
      ON DUPLICATE KEY UPDATE ${updateClause.join(", ")}
      `,
      insertValues
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