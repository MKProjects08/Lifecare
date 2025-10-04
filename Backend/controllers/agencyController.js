const db = require('../config/db');

// ===================== Get All Agencies =====================
exports.getAgencies = async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM agency");
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ===================== Get Agency by ID =====================
exports.getAgencyById = async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM agency WHERE id = ?", [req.params.id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: "Agency not found" });
        }
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ===================== Create New Agency =====================
exports.createAgency = async (req, res) => {
    try {
        const { agencyname, contact_person, phone, email, address, sales, target } = req.body;

        const [result] = await db.query(
            "INSERT INTO agency (agencyname, contact_person, phone, email, address, sales, target) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [agencyname, contact_person, phone, email, address, sales, target]
        );

        res.json({ message: "Agency created successfully", id: result.insertId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ===================== Update Agency =====================
exports.updateAgency = async (req, res) => {
    try {
        const { agencyname, contact_person, phone, email, address, sales, target } = req.body;

        const [result] = await db.query(
            "UPDATE agency SET agencyname=?, contact_person=?, phone=?, email=?, address=?, sales=?, target=? WHERE id=?",
            [agencyname, contact_person, phone, email, address, sales, target, req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Agency not found" });
        }

        res.json({ message: "Agency updated successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ===================== Delete Agency =====================
exports.deleteAgency = async (req, res) => {
    try {
        const [result] = await db.query("DELETE FROM agency WHERE id=?", [req.params.id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Agency not found" });
        }

        res.json({ message: "Agency deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
