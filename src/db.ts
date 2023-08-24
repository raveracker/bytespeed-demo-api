import { Pool } from "pg";

const db = new Pool({
  user: "bytespeed",
  host: "localhost",
  database: "bytespeed_demo_db",
  password: "bytespeed",
  port: 5432, // Default PostgreSQL port
});

export default db;
