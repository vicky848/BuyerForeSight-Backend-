const express = require("express");
const router = express.Router();
const db = require("../db");

// GET /users?search=&sort=&order=
router.get("/", (req, res) => {
    let { search, sort, order } = req.query;
    let query = "SELECT * FROM users";
    let params = [];

    if (search) {
        query += " WHERE name LIKE ? OR email LIKE ?";
        params.push(`%${search}%`, `%${search}%`);
    }

    if (sort) {
        order = order?.toUpperCase() === "DESC" ? "DESC" : "ASC";
        query += ` ORDER BY ${sort} ${order}`;
    }

    db.all(query, params, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// GET /users/:id
router.get("/:id", (req, res) => {
    const { id } = req.params;
    db.get("SELECT * FROM users WHERE id = ?", [id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ message: "User not found" });
        res.json(row);
    });
});

// POST /users
router.post("/", (req, res) => {
    const { name, email, age } = req.body;
    if (!name || !email) return res.status(400).json({ message: "Name and email are required" });

    db.run(
        "INSERT INTO users (name, email, age) VALUES (?, ?, ?)",
        [name, email, age || null],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ id: this.lastID, name, email, age });
        }
    );
});

// PUT /users/:id
router.put("/:id", (req, res) => {
    const { id } = req.params;
    const { name, email, age } = req.body;

    db.run(
        "UPDATE users SET name = ?, email = ?, age = ? WHERE id = ?",
        [name, email, age, id],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            if (this.changes === 0) return res.status(404).json({ message: "User not found" });
            res.json({ id, name, email, age });
        }
    );
});

// DELETE /users/:id
router.delete("/:id", (req, res) => {
    const { id } = req.params;
    db.run("DELETE FROM users WHERE id = ?", [id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ message: "User not found" });
        res.json({ message: "User deleted successfully" });
    });
});

module.exports = router;