const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const pool = require('../config/db');

// Configure email transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

const authController = {
  async signIn(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
      }

      // Query user by email
      const [rows] = await pool.execute(
        'SELECT * FROM Users WHERE email = ? AND is_active = TRUE',
        [email]
      );

      if (rows.length === 0) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const user = rows[0];

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Generate JWT
      const token = jwt.sign(
        {
          userId: user.User_ID,
          username: user.username,
          role: user.role
        },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      res.status(200).json({
        token,
        user: {
          id: user.User_ID,
          username: user.username,
          role: user.role,
          email: user.email
        }
      });
    } catch (error) {
      console.error('Sign-in error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  async forgotPassword(req, res) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ message: 'Email is required' });
      }

      // Check if user exists
      const [rows] = await pool.execute(
        'SELECT User_ID, email, username FROM Users WHERE email = ? AND is_active = TRUE',
        [email]
      );

      if (rows.length === 0) {
        // Don't reveal if email exists or not for security
        return res.status(200).json({ 
          success: true,
          message: 'If the email exists, a temporary password has been sent' 
        });
      }

      const user = rows[0];

      // Generate temporary password (8 chars: uppercase, lowercase, number, special)
      const tempPassword = crypto.randomBytes(4).toString('hex') + 'A1@';
      const hashedTempPassword = await bcrypt.hash(tempPassword, 10);

      // Store temp password with expiry (30 minutes)
      const expiryTime = new Date(Date.now() + 30 * 60 * 1000);
      
      await pool.execute(
        `UPDATE Users 
         SET temp_password = ?, 
             temp_password_expiry = ? 
         WHERE User_ID = ?`,
        [hashedTempPassword, expiryTime, user.User_ID]
      );

      // Send email with temporary password
      const mailOptions = {
        from: process.env.MAIL_FROM,
        to: email,
        subject: 'Password Reset - Temporary Password',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #039e3f;">Password Reset Request</h2>
            <p>Hello ${user.username},</p>
            <p>You requested to reset your password. Use the temporary password below to proceed:</p>
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <strong style="font-size: 18px; color: #048dcc;">${tempPassword}</strong>
            </div>
            <p><strong>This temporary password will expire in 30 minutes.</strong></p>
            <p>If you didn't request this, please ignore this email.</p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
            <p style="color: #666; font-size: 12px;">This is an automated message, please do not reply.</p>
          </div>
        `
      };

      await transporter.sendMail(mailOptions);

      res.status(200).json({
        success: true,
        message: 'Temporary password sent to your email',
        data: {
          username: user.username
        }
      });

    } catch (error) {
      console.error('Forgot password error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  async resetPassword(req, res) {
    try {
      const { email, tempPassword, newPassword } = req.body;

      if (!email || !tempPassword || !newPassword) {
        return res.status(400).json({ 
          message: 'Email, temporary password, and new password are required' 
        });
      }

      // Validate new password format
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$!%?&])[A-Za-z\d@#$!%?&]{8,}$/;
      if (!passwordRegex.test(newPassword)) {
        return res.status(400).json({ 
          message: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character' 
        });
      }

      // Get user with temp password
      const [rows] = await pool.execute(
        `SELECT User_ID, temp_password, temp_password_expiry 
         FROM Users 
         WHERE email = ? AND is_active = TRUE`,
        [email]
      );

      if (rows.length === 0) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const user = rows[0];

      // Check if temp password exists
      if (!user.temp_password || !user.temp_password_expiry) {
        return res.status(401).json({ message: 'No active password reset request found' });
      }

      // Check if temp password has expired
      if (new Date() > new Date(user.temp_password_expiry)) {
        return res.status(401).json({ message: 'Temporary password has expired' });
      }

      // Verify temporary password
      const isTempPasswordValid = await bcrypt.compare(tempPassword, user.temp_password);
      if (!isTempPasswordValid) {
        return res.status(401).json({ message: 'Invalid temporary password' });
      }

      // Hash new password
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);

      // Update password and clear temp password
      await pool.execute(
        `UPDATE Users 
         SET password = ?, 
             temp_password = NULL, 
             temp_password_expiry = NULL 
         WHERE User_ID = ?`,
        [hashedNewPassword, user.User_ID]
      );

      res.status(200).json({
        success: true,
        message: 'Password reset successfully'
      });

    } catch (error) {
      console.error('Reset password error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
};

module.exports = authController;