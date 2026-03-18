import mysqldump from 'mysqldump';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// HELPERS --------------------------------------------

const getBackupDirectory = () =>
  // /server/services/backup -> /server/services/uploads/backups
  path.join(__dirname, '../uploads/backups');

const formatFileSizeKb = (bytes) =>
  `${(bytes / 1024).toFixed(2)} KB`;

const createHttpError = (message, statusCode) =>
  Object.assign(new Error(message), { statusCode });

const buildBackupBaseName = (env, date = new Date()) => {
  const day = String(date.getDate()).padStart(2, '0');
  const monthShort = date.toLocaleString('en-US', { month: 'short' }); // Jan, Feb, ...
  const year = date.getFullYear();

  return `e-tbayat_${env}_${day}-${monthShort}-${year}`;
};

// SERVICES -------------------------------------------

const cleanOldBackups = (maxAgeDays = 30) => {
  const backupDir = getBackupDirectory();
  if (!fs.existsSync(backupDir)) return;

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - maxAgeDays);

  const files = fs
    .readdirSync(backupDir)
    .filter((file) => file.endsWith('.sql'));

  files.forEach((file) => {
    const filePath = path.join(backupDir, file);
    try {
      const stat = fs.statSync(filePath);
      const fileDate = stat.birthtime.getFullYear() > 2000 ? stat.birthtime : stat.mtime;
      if (fileDate < cutoff) {
        fs.unlinkSync(filePath);
      }
    } catch {}
  });
};

const pruneOldBackups = (maxBackups = 5) => {
  const backups = getBackups(); // newest first
  if (backups.length <= maxBackups) return;

  const toDelete = backups.slice(maxBackups); // all older than the most recent N
  const backupDir = getBackupDirectory();

  toDelete.forEach(({ filename }) => {
    const filePath = path.join(backupDir, filename);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch {
        // ignore individual delete failures here; they are non-critical
      }
    }
  });
};

export const createBackup = async () => {
  const env = process.env.NODE_ENV || 'local';
  const backupDir = getBackupDirectory();

  fs.mkdirSync(backupDir, { recursive: true });

  const baseName = buildBackupBaseName(env);

  const existingForDay = fs
    .readdirSync(backupDir)
    .filter((file) => file.startsWith(baseName) && file.endsWith('.sql'));

  const version = existingForDay.length + 1;
  const filename = `${baseName}_v${String(version).padStart(2, '0')}.sql`;
  const fullPath = path.join(backupDir, filename);

  try {
    await mysqldump({
      connection: {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
      },
      dumpToFile: fullPath,
    });
  } catch (err) {
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
    throw createHttpError('Failed to create database backup', 500);
  }

  pruneOldBackups(10);
  cleanOldBackups(30)

  return filename;
};

export const restoreBackup = (filePath) =>
  new Promise((resolve, reject) => {
  const command = `mysql -h ${process.env.DB_HOST} -u ${process.env.DB_USER} -p${process.env.DB_PASSWORD} ${process.env.DB_NAME} < "${filePath}"`;

  exec(command, (error) => {
    if (error) {
      return reject(createHttpError('Failed to restore database from backup', 500));
    }
    resolve('Restore complete');
  });
});

export const getBackups = () => {
  const backupDir = getBackupDirectory();

  if (!fs.existsSync(backupDir)) {
    return [];
  }

  const files = fs
    .readdirSync(backupDir)
    .filter((file) => file.endsWith('.sql'))
    .map((file) => {
      const filePath = path.join(backupDir, file);
      const stat = fs.statSync(filePath);

      return {
        filename: file,
        size: formatFileSizeKb(stat.size),
        createdAt: stat.birthtime,
      };
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // latest first

  return files;
};

export const deleteBackup = (filename) => {
  const backupDir = getBackupDirectory();
  const filePath = path.join(backupDir, filename);

  if (!fs.existsSync(filePath)) {
    throw createHttpError('Backup file not found', 404);
  }

  try {
    fs.unlinkSync(filePath);
  } catch (err) {
    throw createHttpError('Failed to delete backup file', 500);
  }
};

export const deleteAllBackups = () => {
  const backupDir = getBackupDirectory();
  if (!fs.existsSync(backupDir)) return;

  const files = fs.readdirSync(backupDir).filter((file) => file.endsWith('.sql'));
  files.forEach((file) => {
    const filePath = path.join(backupDir, file);
    try {
      fs.unlinkSync(filePath);
    } catch {
      // ignore individual failures
    }
  });
};
