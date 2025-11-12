const express = require('express');
const router = express.Router();
const backupController = require('../controllers/backupController');

// POST /api/backup/email
router.post('/email', backupController.emailBackup);

module.exports = router;
