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

// ✅ FIXED: Create new product
exports.createProduct = async (req, res) => {
  try {
    const { 
      productname, 
      generic_name, 
      BatchNumber, // ✅ ADD THIS
      quantity, 
      purchase_price, 
      selling_price, 
      expiry_date, 
      Agency_ID,
      is_active 
    } = req.body;

    console.log('Received data:', req.body); // Debug log

    // ✅ UPDATED SQL with BatchNumber
    const sql = `
      INSERT INTO products 
      (productname, generic_name, BatchNumber, quantity, purchase_price, selling_price, expiry_date, Agency_ID, is_active) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const values = [
      productname, 
      generic_name, 
      BatchNumber, // ✅ ADD THIS
      quantity, 
      purchase_price, 
      selling_price, 
      expiry_date, 
      Agency_ID,
      is_active || 1 // ✅ ADD THIS
    ];

    console.log('Executing SQL with values:', values); // Debug log

    const [result] = await db.query(sql, values);
    res.status(201).json({ 
      message: "Product created successfully", 
      productId: result.insertId 
    });
  } catch (err) {
    console.error('Error creating product:', err);
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
