import dotenv from "dotenv";
import express from "express";
import pg from "pg";
import cors from "cors";
import { fileURLToPath } from "url";
import path from "path";

dotenv.config();

const { Pool } = pg;
const app = express();
const port = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(cors());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function initializeDatabase() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS counter (
        id SERIAL PRIMARY KEY,
        value INTEGER DEFAULT 0
      )
    `);
    const result = await client.query("SELECT * FROM counter");
    if (result.rows.length === 0) {
      await client.query("INSERT INTO counter (value) VALUES (0)");
    }
  } finally {
    client.release();
  }
}

initializeDatabase();

app.get("/api/count", async (req, res) => {
  const client = await pool.connect();
  try {
    const result = await client.query("SELECT value FROM counter");
    res.json({ count: result.rows[0].value });
  } finally {
    client.release();
  }
});

app.post("/api/increment", async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("UPDATE counter SET value = value + 1");
    const result = await client.query("SELECT value FROM counter");
    res.json({ count: result.rows[0].value });
  } finally {
    client.release();
  }
});

if (process.env.NODE_ENV === "production") {
  app.use(express.static("dist"));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "dist", "index.html"));
  });
}

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
