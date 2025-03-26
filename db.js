require("dotenv").config();
const { Pool } = require("pg");

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASS, // Kalit nomi noto‘g‘ri bo‘lsa, parol `undefined` bo‘ladi!
    port: process.env.DB_PORT
});

module.exports = pool;
