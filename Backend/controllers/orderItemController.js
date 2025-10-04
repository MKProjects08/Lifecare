const db = require("../config/db");

// ✅ Get all order items
exports.getOrderItems = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM OrderItem");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Get order item by ID
exports.getOrderItemById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query("SELECT * FROM OrderItem WHERE id = ?", [id]);
    if (rows.length === 0) return res.status(404).json({ message: "Order item not found" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Get all items for a specific order
exports.getItemsByOrderId = async (req, res) => {
  try {
    const { orderId } = req.params;
    const [rows] = await db.query("SELECT * FROM OrderItem WHERE Order_ID = ?", [orderId]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Create new order item
exports.createOrderItem = async (req, res) => {
  try {
    const { Order_ID, Product_ID, BatchNumber, quantity, free_issue_quantity } = req.body;
    const sql = `
      INSERT INTO OrderItem
      (Order_ID, Product_ID, BatchNumber, quantity, free_issue_quantity)
      VALUES (?, ?, ?, ?, ?)
    `;
    const [result] = await db.query(sql, [Order_ID, Product_ID, BatchNumber, quantity, free_issue_quantity]);
    res.status(201).json({ message: "Order item created", orderItemId: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Update order item
exports.updateOrderItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { Order_ID, Product_ID, BatchNumber, quantity, free_issue_quantity } = req.body;
    const sql = `
      UPDATE OrderItem
      SET Order_ID=?, Product_ID=?, BatchNumber=?, quantity=?, free_issue_quantity=?
      WHERE id=?
    `;
    const [result] = await db.query(sql, [Order_ID, Product_ID, BatchNumber, quantity, free_issue_quantity, id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: "Order item not found" });
    res.json({ message: "Order item updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Delete order item
exports.deleteOrderItem = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query("DELETE FROM OrderItem WHERE id = ?", [id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: "Order item not found" });
    res.json({ message: "Order item deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
