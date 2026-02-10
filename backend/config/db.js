<<<<<<< Updated upstream
const mysql = require("mysql2");
=======
const mysql = require("mysql2/promise");
>>>>>>> Stashed changes
require("dotenv").config();

const db = mysql.createPool({
  host: "localhost",
  user: "meddiary_user",
  password: "meddiary123",
  database: "meddiary",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = db;