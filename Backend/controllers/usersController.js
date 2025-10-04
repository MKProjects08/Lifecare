const db = require("../config/db");
const bcrypt = require("bcrypt");

// ✅ Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM users");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query("SELECT * FROM users WHERE UserID = ?", [id]);
    if (rows.length === 0) return res.status(404).json({ message: "User not found" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Create new user
exports.createUser = async (req, res) => {
  try {
    const { username, password, role, email, phone } = req.body;

    // Hash password before storing
    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = `
      INSERT INTO users (username, password, role, email, phone)
      VALUES (?, ?, ?, ?, ?)
    `;
    const [result] = await db.query(sql, [username, hashedPassword, role, email, phone]);
    res.status(201).json({ message: "User created", userId: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Update user
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, password, role, email, phone } = req.body;

    // Hash password if provided
    const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;

    let sql = "UPDATE users SET username=?, role=?, email=?, phone=?";
    const params = [username, role, email, phone];

    if (hashedPassword) {
      sql += ", password=?";
      params.push(hashedPassword);
    }

    sql += " WHERE UserID=?";
    params.push(id);

    const [result] = await db.query(sql, params);

    if (result.affectedRows === 0) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Soft delete user
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.query(
      "UPDATE Users SET is_active = FALSE WHERE User_ID = ?",
      [id]
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ message: "User not found" });

    res.json({ message: "User marked as inactive (soft deleted) successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
