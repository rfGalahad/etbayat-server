import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createBackup, restoreBackup, getBackups, deleteBackup, deleteAllBackups } from '../../services/backup/backupService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const download = async (req, res) => {
  console.log('DOWNLOADING...')
  const backupDir = path.join(__dirname, '../../services/uploads/backups');
  const filePath = path.join(backupDir, req.params.filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: 'Backup file not found' });
  }

  res.download(filePath);
};

export const backup = async (req, res) => {
  try {
    const filename = await createBackup();

    return res.status(201).json({ success: true, filename });

  } catch (err) {
    console.error('Backup error details:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

export const restore = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    // Write buffer to temp file in the same backup directory used by the service
    const tempPath = path.join(__dirname, `../services/uploads/backups/temp-restore.sql`);
    fs.writeFileSync(tempPath, req.file.buffer);

    await restoreBackup(tempPath);

    // Delete temp file after restore
    fs.unlinkSync(tempPath);

    res.json({ success: true, message: 'Database restored successfully' });

  } catch (err) {
    console.error('Restore error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

export const listBackups = (req, res) => {
  try {
    const backups = getBackups();
    return res.status(200).json({ success: true, backups });
  } catch (err) {
    const status = err.statusCode || 500;
    return res.status(status).json({ success: false, error: err.message });
  }
};

export const removeBackup = (req, res) => {
  try {
    const { filename } = req.params;
    deleteBackup(filename);
    return res.status(200).json({ success: true, message: 'Backup deleted' });
  } catch (err) {
    console.error('Remove backup error:', err);
    const status = err.statusCode || 500;
    return res.status(status).json({ success: false, error: err.message });
  }
};

export const removeAllBackups = (req, res) => {
  try {
    deleteAllBackups();
    return res.status(200).json({ success: true, message: 'All backups deleted' });
  } catch (err) {
    console.error('Remove ALL backups error:', err);
    const status = err.statusCode || 500;
    return res.status(status).json({ success: false, error: err.message });
  }
};