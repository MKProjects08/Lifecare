const db = require("../config/db");

// ✅ Get all orders
// ✅ Get all orders (user-friendly)
exports.getAllOrders = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        o.Order_ID,
        CONCAT('O', LPAD(o.Order_ID, 5, '0')) AS FormattedOrderID,
        o.paid_date,
        o.paymentstatus,
        o.print_count,
        o.gross_total,
        o.net_total,
        o.discount_amount,
        o.created_at,
        c.pharmacyname AS CustomerName,
        a.agencyname AS AgencyName,
        u.username AS UserName
      FROM Orders o
      JOIN Customers c ON o.Customer_ID = c.Customer_ID
      JOIN Agency a ON o.Agency_ID = a.Agency_ID
      JOIN Users u ON o.User_ID = u.User_ID
      ORDER BY o.Order_ID DESC
    `);

    // Convert DECIMAL strings to numbers
    const formattedRows = rows.map(r => ({
      ...r,
      gross_total: parseFloat(r.gross_total),
      net_total: parseFloat(r.net_total),
      discount_amount: parseFloat(r.discount_amount)
    }));

    res.json(formattedRows);
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
