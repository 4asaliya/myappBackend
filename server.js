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

// CREATE todo
app.post("/todos", async (req, res) => {
  try {
    const { todo_text } = req.body;

    const result = await pool.query(
      "INSERT INTO todo (todo_text, is_completed) VALUES ($1, false) RETURNING *",
      [todo_text]
    );

    res.json(result.rows[0]);

  } catch (error) {
    console.error("Error creating todo:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// UPDATE todo
app.put("/todos/:id", async (req, res) => {
  try {

    const { id } = req.params;
    const { todo_text, is_completed } = req.body;

    const result = await pool.query(
      "UPDATE todo SET todo_text = $1, is_completed = $2 WHERE id = $3 RETURNING *",
      [todo_text, is_completed, id]
    );

    res.json(result.rows[0]);

  } catch (error) {
    console.error("Error updating todo:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE todo
app.delete("/todos/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query("DELETE FROM todo WHERE id = $1", [id]);

    res.json({ message: "Todo deleted" });
  } catch (error) {
    console.error("Error deleting todo:", error);
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
  console.log(`Server running on port ${PORT}`);
});

//curl -X POST http://localhost:5000/todos -H "Content-Type:application/json" -d'("title":"Buy groceries")'