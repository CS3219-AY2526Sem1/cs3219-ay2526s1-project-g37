const { Pool } = require("pg");

const pool = new Pool({
    host: process.env.USER_DB_HOST,
    user: process.env.USER_DB_USER,
    password: process.env.USER_DB_PASSWORD,
    database: process.env.USER_DB_NAME,
    port: process.env.USER_DB_PORT,
    idleTimeoutMillis: 30000,
    // SSL configuration for AWS RDS
    ssl: process.env.USER_DB_HOST && process.env.USER_DB_HOST.includes('rds.amazonaws.com') 
        ? { rejectUnauthorized: false } 
        : false
});

exports.pool = pool;
