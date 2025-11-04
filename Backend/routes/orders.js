// routes/orders.js - CORRECTED VERSION
const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// ⚠️ CRITICAL: Put specific routes BEFORE parameter routes (:id)
// Otherwise /:id will catch "create-with-items" and treat it as an id

// Test route to verify routes are working (put first for easy testing)
router.get('/test/ping', (req, res) => {
  res.json({ message: 'Orders routes are working!', timestamp: new Date() });
});

// Create order with items - MUST come BEFORE /:id routes
router.post('/create-with-items', orderController.createOrderWithItems);

// Get all orders
router.get('/', orderController.getAllOrders);

// Create single order (without items)
router.post('/', orderController.createOrder);

// ⚠️ Parameter routes MUST come LAST
// Get order by ID
router.get('/:id', orderController.getOrderById);

// Update order
router.put('/:id', orderController.updateOrder);

// Delete order
router.delete('/:id', orderController.deleteOrder);

module.exports = router;