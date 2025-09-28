const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const db = require('./config/db'); // import promise-based pool

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({ origin: process.env.FRONTEND_URL }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
  res.json({
    message: 'Lifecare Backend API is running!',
    status: 'success',
    timestamp: new Date().toISOString()
  });
});

// Health check
app.get('/health', async (req, res) => {
  try {
    await db.query('SELECT 1'); // test query
    res.json({
      status: 'healthy',
      db: 'connected',
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.json({
      status: 'unhealthy',
      db: 'failed',
      error: err.message,
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    });
  }
});

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 Lifecare Backend server is running on port ${PORT}`);
  console.log(`📡 API endpoint: http://localhost:${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);

  try {
    await db.query('SELECT 1'); // ✅ test connection with promise pool
    console.log('✅ MySQL connected successfully!');
  } catch (err) {
    console.error('❌ MySQL connection failed:', err);
  }
});
