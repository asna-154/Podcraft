// config/database.js
const { Sequelize } = require("sequelize");
require("dotenv").config();

// DB_HOST = "localhost" for now (your local SSMS instance).
// Later, once RDS exists, this becomes your RDS endpoint —
// nothing else in this file changes.
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 1433,
    dialect: "mssql",
    dialectOptions: {
      options: {
        encrypt: true, // set to true once connecting to RDS over the internet
        trustServerCertificate: true, // fine for local dev; revisit for production
      },
    },
    logging: false, // set to console.log if you want to see raw SQL while debugging
  }
);

module.exports = sequelize;