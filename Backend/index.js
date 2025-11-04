const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const productRoutes = require('./routes/products');
const customerRoutes = require('./routes/customers');
const userRoutes = require('./routes/users');
const orderRoutes = require('./routes/orders');
const orderItemRoutes = require('./routes/orderItems');
const agencyRoutes = require('./routes/agencies');
const authRoutes = require('./routes/authroute');
const { authMiddleware, roleMiddleware } = require('./middleware/authmiddleware');
require('dotenv').config();

const app = express();

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));

// Middleware
app.use(bodyParser.json());

// Public routes
app.use('/api/auth', authRoutes);

// Protected routes
app.use('/api/products', 
  authMiddleware, 
  roleMiddleware(['admin',  'worker']), // Admin has full access
  productRoutes
);

app.use('/api/customers', 
  authMiddleware, 
  roleMiddleware(['admin']), // Admin has full access
  customerRoutes
);

app.use('/api/users', 
  authMiddleware, 
  roleMiddleware(['admin']), // Admin and Owner only
  userRoutes
);

app.use('/api/agencies', 
  authMiddleware, 
  roleMiddleware(['admin']), // Admin has full access
  agencyRoutes
);

app.use('/api/orders', 
  authMiddleware, 
  roleMiddleware(['admin',  'worker']), // Admin has full access
  orderRoutes
);

app.use('/api/order-items', 
  authMiddleware, 
  roleMiddleware(['admin', 'worker']), // Admin has full access
  orderItemRoutes
);

// Dashboard routes
app.get('/api/owner-dashboard', 
  authMiddleware, 
  roleMiddleware(['admin', 'worker']), // Admin and Owner access
  (req, res) => {
    res.json({ message: 'Welcome to Owner Dashboard', user: req.user });
  }
);

// app.get('/api/worker-dashboard', 
//   authMiddleware, 
//   roleMiddleware(['worker']), // Worker only
//   (req, res) => {
//     res.json({ message: 'Welcome to Worker Dashboard', user: req.user });
//   }
// );

// Test route (public)
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));