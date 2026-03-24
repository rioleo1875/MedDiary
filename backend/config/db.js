const mysql = require("mysql2/promise");

// Log the connection attempt
console.log("DB Config:", {
  host: process.env.DB_HOST || "not set",
  user: process.env.DB_USER || "not set",
  database: process.env.DB_NAME || "not set",
  port: process.env.DB_PORT || "not set"
});

const db = mysql.createPool({
  host: process.env.DB_HOST || "mysql.railway.internal",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "railway",
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test connection on startup
const testConnection = async () => {
  try {
    const connection = await db.getConnection();
    console.log("✅ Database connected successfully!");
    connection.release();
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
  }
};

testConnection();

module.exports = db;