const mysql = require("mysql2");

const db = mysql.createPool({
  host: "localhost",
  user: "meddiary_user",
  password: "meddiary123",
  database: "meddiary",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

db.getConnection((err, connection) => {
  if (err) {
    console.error("❌ MySQL connection failed:", err.message);
  } else {
    console.log("✅ MySQL connected");
    connection.release();
  }
});

module.exports = db;