const mysql = require("mysql2/promise");

const db = mysql.createPool({
  host: "localhost",
  user: "meddiary_user",
  password: "meddiary123",
  database: "meddiary"
});

module.exports = db;