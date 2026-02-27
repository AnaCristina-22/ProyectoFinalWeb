const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "root",
  database: "todo_app",
  waitForConnections: true,
  connectionLimit: 10,
});

app.get("/todos", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id, title, completed, created_at FROM tarea ORDER BY id DESC"
    );

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al listar tareas" });
  }
});


app.get("/todos/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    const [[tarea]] = await db.query(
      "SELECT id, title, completed, created_at FROM tarea WHERE id = ?",
      [id]
    );

    if (!tarea) {
      return res.status(404).json({ message: "Tarea no encontrada" });
    }

    res.json(tarea);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al obtener tarea" });
  }
});

app.post("/todos", async (req, res) => {
  try {
    const { title } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: "title es requerido" });
    }

    const [result] = await db.query(
      "INSERT INTO tarea (title) VALUES (?)",
      [title.trim()]
    );

    const [rows] = await db.query(
      "SELECT id, title, completed, created_at FROM tarea WHERE id = ?",
      [result.insertId]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al crear tarea" });
  }
});


app.put("/todos/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { title } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: "title es requerido" });
    }

    const [result] = await db.query(
      "UPDATE tarea SET title = ? WHERE id = ?",
      [title.trim(), id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Tarea no encontrada" });
    }

    const [rows] = await db.query(
      "SELECT id, title, completed, created_at FROM tarea WHERE id = ?",
      [id]
    );

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al actualizar tarea" });
  }
});


app.patch("/todos/:id/toggle", async (req, res) => {
  try {
    const id = Number(req.params.id);

    const [[tarea]] = await db.query(
      "SELECT completed FROM tarea WHERE id = ?",
      [id]
    );

    if (!tarea) {
      return res.status(404).json({ message: "Tarea no encontrada" });
    }

    const nuevoEstado = tarea.completed ? 0 : 1;

    await db.query(
      "UPDATE tarea SET completed = ? WHERE id = ?",
      [nuevoEstado, id]
    );

    res.json({ message: "Estado actualizado", completed: nuevoEstado });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al hacer toggle" });
  }
});

app.delete("/todos/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    const [result] = await db.query(
      "DELETE FROM tarea WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Tarea no encontrada" });
    }

    res.json({ message: "Eliminada" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al eliminar tarea" });
  }
});

app.listen(PORT, () => {
  console.log(`API corriendo en http://localhost:${PORT}`);
});