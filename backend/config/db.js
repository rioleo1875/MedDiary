const mysql = require("mysql2/promise");

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
  
});
console.log("Loading db.js...");
console.log("DB_HOST from env:", process.env.DB_HOST);

module.exports = db;