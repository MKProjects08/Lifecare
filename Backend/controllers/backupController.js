const path = require('path');
const os = require('os');
const fs = require('fs').promises;
const { existsSync } = require('fs');
const nodemailer = require('nodemailer');
const mysqldump = require('mysqldump');

// POST /api/backup/email
exports.emailBackup = async (req, res) => {
  try {
    const {
      DB_HOST,
      DB_USER,
      DB_PASSWORD,
      DB_NAME,
      DB_PORT,
      SMTP_HOST,
      SMTP_PORT,
      SMTP_USER,
      SMTP_PASS,
      MAIL_FROM,
      BACKUP_RECIPIENT
    } = process.env;

    const missingEmail = [
      ['SMTP_HOST', SMTP_HOST],
      ['SMTP_PORT', SMTP_PORT],
      ['SMTP_USER', SMTP_USER],
      ['SMTP_PASS', SMTP_PASS],
      ['MAIL_FROM', MAIL_FROM],
      ['BACKUP_RECIPIENT', BACKUP_RECIPIENT],
    ].filter(([, v]) => !v).map(([k]) => k);

    if (missingEmail.length) {
      return res.status(400).json({
        message: 'Email is not configured. Missing env vars: ' + missingEmail.join(', ')
      });
    }

    const missingDb = [
      ['DB_HOST', DB_HOST],
      ['DB_USER', DB_USER],
      ['DB_NAME', DB_NAME],
    ].filter(([, v]) => !v).map(([k]) => k);

    if (missingDb.length) {
      return res.status(400).json({
        message: 'Database env is not fully configured. Missing: ' + missingDb.join(', ')
      });
    }

    const d = new Date();
    const pad = (n) => (n < 10 ? `0${n}` : `${n}`);
    const timestamp = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
    const fileName = `db-backup-${DB_NAME}-${timestamp}.sql`;
    const tempDir = os.tmpdir();
    const dumpPath = path.join(tempDir, fileName);

    // Create MySQL dump to a temp file (works reliably across platforms)
    await mysqldump({
      connection: {
        host: DB_HOST,
        user: DB_USER,
        password: DB_PASSWORD || '',
        database: DB_NAME,
        port: DB_PORT ? Number(DB_PORT) : 3306,
      },
      dumpToFile: dumpPath,
    });

    // Read file into memory
    const fileBuffer = await fs.readFile(dumpPath);

    // Setup transporter
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT),
      secure: Number(SMTP_PORT) === 465, // true for 465, false for others
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });

    // Send email
    await transporter.sendMail({
      from: MAIL_FROM,
      to: BACKUP_RECIPIENT,
      subject: `Database Backup - ${DB_NAME} - ${timestamp}`,
      text: `Attached is the database backup for ${DB_NAME} generated at ${timestamp}.`,
      attachments: [
        {
          filename: fileName,
          content: fileBuffer,
          contentType: 'application/sql',
        },
      ],
    });

    // Cleanup
    try {
      if (existsSync(dumpPath)) {
        await fs.unlink(dumpPath);
      }
    } catch (_) {}

    return res.status(200).json({ message: 'Backup created and emailed successfully' });
  } catch (error) {
    console.error('Backup email error:', error);
    return res.status(500).json({ message: 'Failed to create or send backup', error: error.message });
  }
};
