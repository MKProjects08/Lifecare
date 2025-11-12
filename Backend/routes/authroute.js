const express = require('express');
const authController = require('../controllers/authcontroller');
const router = express.Router();

router.post('/signin', authController.signIn);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

module.exports = router;