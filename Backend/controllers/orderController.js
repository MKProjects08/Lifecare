const db = require("../config/db");

// ✅ Get all orders
exports.getOrders = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM Orders");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Get order by ID
exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query("SELECT * FROM Orders WHERE id = ?", [id]);
    if (rows.length === 0) return res.status(404).json({ message: "Order not found" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Create new order
exports.createOrder = async (req, res) => {
  try {
    const { Customer_ID, Agency_ID, User_ID, paid_date, paymentstatus, print_count, gross_total, net_total, discount_amount } = req.body;
    const sql = `
      INSERT INTO Orders 
      (Customer_ID, Agency_ID, User_ID, paid_date, paymentstatus, print_count, gross_total, net_total, discount_amount)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await db.query(sql, [Customer_ID, Agency_ID, User_ID, paid_date, paymentstatus, print_count, gross_total, net_total, discount_amount]);
    res.status(201).json({ message: "Order created", orderId: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Update order
exports.updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { Customer_ID, Agency_ID, User_ID, paid_date, paymentstatus, print_count, gross_total, net_total, discount_amount } = req.body;
    const sql = `
      UPDATE Orders
      SET Customer_ID=?, Agency_ID=?, User_ID=?, paid_date=?, paymentstatus=?, print_count=?, gross_total=?, net_total=?, discount_amount=?
      WHERE id=?
    `;
    const [result] = await db.query(sql, [Customer_ID, Agency_ID, User_ID, paid_date, paymentstatus, print_count, gross_total, net_total, discount_amount, id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: "Order not found" });
    res.json({ message: "Order updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Delete order
exports.deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query("DELETE FROM Orders WHERE id = ?", [id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: "Order not found" });
    res.json({ message: "Order deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
