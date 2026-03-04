require("dotenv").config();
const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());


const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

// GET all todos
app.get("/todos", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM todo ORDER BY id ASC");
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching todos:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

//Get Health
app.get("/", (req, res) => {
  res.send("API is running...");
});

//To run server at port 5000
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log('Server running on port ${PORT}');
});