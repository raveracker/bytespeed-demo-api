import { Pool } from "pg";

const db = new Pool({
  user: "bytespeed",
  host: "dpg-cjju5l337aks73dgd6pg-a",
  database: "bytespeed",
  password: "4iUlxiD5s3NDRxsft6KAaoXyDQhfIUeE",
  port: 5432, // Default PostgreSQL port
});

export default db;
