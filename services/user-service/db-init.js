const { pool } = require("./db-config");

const createTableQuery = `
  CREATE TABLE IF NOT EXISTS users (
    uuid VARCHAR(255) PRIMARY KEY,
    username VARCHAR(255),
    role SMALLINT NOT NULL DEFAULT 0 CHECK (role IN (0, 1)),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`;

const initDB = async () => {
    try {
        const client = await pool.connect();
        await client.query(createTableQuery);
        console.log("User table initialized successfully.");
        client.release();
    } catch (error) {
        console.error("Error initializing user table:", error);
        process.exit(1);
    } finally {
        await pool.end();
    }
};

initDB();
