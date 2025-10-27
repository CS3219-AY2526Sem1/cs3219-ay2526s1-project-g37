const express = require("express");
const { pool } = require("./db-config");
const app = express();
app.use(express.json());
const dotenv = require("dotenv");
dotenv.config();

app.get("/health", (req, res) => {
    res.send("User Service is healthy");
});

app.get("/:uuid", async (req, res) => {
    try {
        const { uuid } = req.params;
        const client = await pool.connect();
        const result = await client.query("SELECT * FROM users where uuid = $1;", [uuid]);
        client.release();
        res.status(200).json(result.rows);
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

app.post("/register", async (req, res) => {
    const { uuid, username, role } = req.body;
    try {
        const client = await pool.connect();
        const insertQuery = "INSERT INTO users (uuid, username, role) VALUES ($1, $2, $3) RETURNING *;";
        const values = [uuid, username, role || 0];
        const result = await client.query(insertQuery, values);
        client.release();
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

app.put("/update/:uuid", async (req, res) => {
    const { uuid } = req.params;
    const { username } = req.body;
    try {
        const client = await pool.connect();
        const updateQuery = "UPDATE users SET username = $1 WHERE uuid = $2 RETURNING *;";
        const values = [username, uuid];
        const result = await client.query(updateQuery, values);
        client.release();
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

const PORT = process.env.USER_PORT || 8003;
app.listen(PORT, () => {
    console.log(`User Service is running on port ${PORT}`);
});

