const db = require("../config/db"); // this is your mysql2/promise pool

// ✅ Get all products
exports.getAllProducts = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM products");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Get product by ID
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query("SELECT * FROM products WHERE BatchNumber = ?", [id]);
    if (rows.length === 0) return res.status(404).json({ message: "Product not found" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Create new product
exports.createProduct = async (req, res) => {
  try {
    const { productname, generic_name, quantity, purchase_price, selling_price, expiry_date, Agency_ID } = req.body;
    const sql = `
      INSERT INTO products 
      (productname, generic_name, quantity, purchase_price, selling_price, expiry_date, Agency_ID) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await db.query(sql, [productname, generic_name, quantity, purchase_price, selling_price, expiry_date, Agency_ID]);
    res.status(201).json({ message: "Product created", productId: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Update product
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { productname, generic_name, quantity, purchase_price, selling_price, expiry_date, Agency_ID } = req.body;
    const sql = `
      UPDATE products 
      SET productname=?, generic_name=?, quantity=?, purchase_price=?, selling_price=?, expiry_date=?, Agency_ID=? 
      WHERE BatchNumber=?
    `;
    const [result] = await db.query(sql, [productname, generic_name, quantity, purchase_price, selling_price, expiry_date, Agency_ID, id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Product updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/// ✅ Soft delete product
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.query(
      "UPDATE Products SET is_active = FALSE WHERE BatchNumber = ?",
      [id]
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Product not found" });

    res.json({ message: "Product marked as inactive (soft deleted) successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
