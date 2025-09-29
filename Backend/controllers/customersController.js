const db = require("../config/db");

// ✅ Get all customers
exports.getAllCustomers = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM customers");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Get customer by ID
exports.getCustomerById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query("SELECT * FROM customers WHERE CustomerID = ?", [id]);
    if (rows.length === 0) return res.status(404).json({ message: "Customer not found" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Create new customer
exports.createCustomer = async (req, res) => {
  try {
    const { pharmacyname, owner_name, phone, address, email, credits } = req.body;
    const sql = `
      INSERT INTO customers (pharmacyname, owner_name, phone, address, email, credits)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const [result] = await db.query(sql, [pharmacyname, owner_name, phone, address, email, credits]);
    res.status(201).json({ message: "Customer created", customerId: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Update customer
exports.updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const { pharmacyname, owner_name, phone, address, email, credits } = req.body;
    const sql = `
      UPDATE customers 
      SET pharmacyname=?, owner_name=?, phone=?, address=?, email=?, credits=? 
      WHERE CustomerID=?
    `;
    const [result] = await db.query(sql, [pharmacyname, owner_name, phone, address, email, credits, id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: "Customer not found" });
    res.json({ message: "Customer updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Delete customer
exports.deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query("DELETE FROM customers WHERE CustomerID = ?", [id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: "Customer not found" });
    res.json({ message: "Customer deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
