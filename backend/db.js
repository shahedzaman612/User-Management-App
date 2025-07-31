// db.js
import mysql from "mysql2/promise";

// Create and export a MySQL connection
export const db = await mysql.createConnection({
  host: "localhost", // or '127.0.0.1'
  user: "root", // replace with your MySQL username
  password: "shahed", // replace with your MySQL password
  database: "user_management", // make sure this database exists
});
