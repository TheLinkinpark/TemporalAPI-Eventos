const express = require("express");
const app = express();
const PORT = 3000;

// Middleware para parsear JSON
app.use(express.json());

// "Base de datos" simulada en memoria
let tareas = [
  { id: 1, titulo: "Aprender Node.js", completada: false },
  { id: 2, titulo: "Crear un CRUD", completada: false },
];

let siguienteId = 3;

// ============= RUTAS CRUD =============

// READ - Obtener todas las tareas
app.get("/api/tareas", (req, res) => {
  res.json(tareas);
});

// READ - Obtener una tarea por ID
app.get("/api/tareas/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const tarea = tareas.find((t) => t.id === id);

  if (!tarea) {
    return res.status(404).json({ error: "Tarea no encontrada" });
  }

  res.json(tarea);
});

// CREATE - Crear una nueva tarea
app.post("/api/tareas", (req, res) => {
  const { titulo, completada } = req.body;

  if (!titulo) {
    return res.status(400).json({ error: "El título es obligatorio" });
  }

  const nuevaTarea = {
    id: siguienteId++,
    titulo,
    completada: completada || false,
  };

  tareas.push(nuevaTarea);
  res.status(201).json(nuevaTarea);
});

// UPDATE - Actualizar una tarea existente
app.put("/api/tareas/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const { titulo, completada } = req.body;

  const indice = tareas.findIndex((t) => t.id === id);

  if (indice === -1) {
    return res.status(404).json({ error: "Tarea no encontrada" });
  }

  // Actualizar solo los campos proporcionados
  if (titulo !== undefined) tareas[indice].titulo = titulo;
  if (completada !== undefined) tareas[indice].completada = completada;

  res.json(tareas[indice]);
});

// DELETE - Eliminar una tarea
app.delete("/api/tareas/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const indice = tareas.findIndex((t) => t.id === id);

  if (indice === -1) {
    return res.status(404).json({ error: "Tarea no encontrada" });
  }

  const tareaEliminada = tareas.splice(indice, 1)[0];
  res.json({ mensaje: "Tarea eliminada", tarea: tareaEliminada });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  console.log("\nPrueba estas rutas:");
  console.log("GET    /api/tareas      - Ver todas las tareas");
  console.log("GET    /api/tareas/:id  - Ver una tarea");
  console.log("POST   /api/tareas      - Crear tarea");
  console.log("PUT    /api/tareas/:id  - Actualizar tarea");
  console.log("DELETE /api/tareas/:id  - Eliminar tarea");
});
