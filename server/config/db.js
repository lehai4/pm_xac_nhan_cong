// config/db.js
const mysql = require("mysql2");
require("dotenv").config();

const HOST = process.env.HOSTMY_SQL;
const USER = process.env.USERMY_SQL;
const PASS = process.env.PASSMY_SQL;
const DBMYSQL = process.env.DATABASEMY_SQL;

const pool = mysql.createPool({
  host: HOST,
  user: USER,
  password: PASS,
  database: DBMYSQL,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const promisePool = pool.promise();
module.exports = promisePool;
