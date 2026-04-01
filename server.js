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



// HEALTH CHECK
app.get("/health", (req, res) => {
  res.send("API is Healthy");
});


// GET ALL TODOS (READ)
app.get("/todos", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM todo ORDER BY id ASC");
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching todos:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


// GET SINGLE TODO
app.get("/todos/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query("SELECT * FROM todo WHERE id = $1", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Todo not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching todo:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


// CREATE TODO
app.post("/todos", async (req, res) => {
  const { todo_text, is_completed } = req.body;

  try {
    const result = await pool.query(
      "INSERT INTO todo (todo_text, is_completed) VALUES ($1, $2) RETURNING *",
      [todo_text, is_completed ?? false]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error creating todo:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


// UPDATE TODO
app.put("/todos/:id", async (req, res) => {
  const { id } = req.params;
  const { todo_text, is_completed } = req.body;

  try {
    const result = await pool.query(
      "UPDATE todo SET todo_text = $1, is_completed  = $2 WHERE id = $3 RETURNING *",
      [todo_text, is_completed, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Todo not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating todo:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


app.delete("/todos/:id", async (req, res) => {
  const id = parseInt(req.params.id, 10);

  if (isNaN(id)) {
    return res.status(400).json({ error: "Invalid todo id" });
  }

  try {
    const result = await pool.query(
      "DELETE FROM todo WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Todo not found" });
    }

    console.log(`Deleted todo id: ${id}`); // Лог для проверки
    res.status(200).json({ message: "Deleted", todo: result.rows[0] });
  } catch (err) {
    console.error("Ошибка удаления:", err);
    res.status(500).json({ error: "Cannot delete todo" });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
//curl -X POST http://localhost:5000/todos   -H "Content-Type: application/json"   -d '{"title":"Buy groceries11"}'

