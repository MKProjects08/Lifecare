const express = require("express");
const router = express.Router();
const orderItemController = require("../controllers/orderItemController");

// Create new order item
router.post("/", orderItemController.createOrderItem);

// Get all order items
router.get("/", orderItemController.getOrderItems);

// Get order items by Order_ID
router.get("/order/:orderId", orderItemController.getItemsByOrderId);

// Update order item
router.put("/:id", orderItemController.updateOrderItem);

// Delete order item
router.delete("/:id", orderItemController.deleteOrderItem);

module.exports = router;
