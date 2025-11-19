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
    const [rows] = await db.query("SELECT * FROM Customers WHERE Customer_ID = ?", [id]);
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
    const { pharmacyname, owner_name, phone, address, email, credits, is_active } = req.body;

    let sql = `
      UPDATE Customers 
      SET pharmacyname=?, owner_name=?, phone=?, address=?, email=?, credits=?
    `;
    const params = [pharmacyname, owner_name, phone, address, email, credits];

    if (typeof is_active !== 'undefined') {
      sql += `, is_active=?`;
      params.push(is_active);
    }

    sql += ` WHERE Customer_ID=?`;
    params.push(id);

    const [result] = await db.query(sql, params);
    if (result.affectedRows === 0) return res.status(404).json({ message: "Customer not found" });
    res.json({ message: "Customer updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Soft delete customer
exports.deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.query(
      "UPDATE Customers SET is_active = FALSE WHERE Customer_ID = ?",
      [id]
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Customer not found" });

    res.json({ message: "Customer marked as inactive (soft deleted) successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
