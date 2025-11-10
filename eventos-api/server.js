const express = require("express");
const cors = require("cors");
const app = express();
const PORT = 3000;

// Middleware para parsear JSON
app.use(express.json(), cors());

// Categorías permitidas
const CATEGORIAS_PERMITIDAS = ["tecnologia", "ciberseguridad", "ia", "conferencias", "anime", "deportes", "musica", "educacion"];

// "Base de datos" simulada en memoria
let eventos = [
  {
    id: 1,
    title: "Conferencia Node.js",
    description: "Aprende lo último en Node.js",
    imgURL:
      "https://plus.unsplash.com/premium_photo-1661877737564-3dfd7282efcb",
    dateTime: "2025-12-16T10:00:00Z",
    category: "conferencias",
  },
  {
    id: 2,
    title: "Workshop Express",
    description: "Crea APIs REST con Express",
    imgURL: "https://images.unsplash.com/photo-1623652554515-91c833e3080e",
    dateTime: "2025-12-20T14:30:00Z",
    category: "tecnologia",
  },
  {
    id: 3,
    title: "Seminario de Ciberseguridad",
    description: "Protege tus aplicaciones web",
    imgURL:
      "https://images.unsplash.com/photo-1510915228340-29c85a43dcfe?",
    dateTime: "2025-10-25T09:00:00Z",
    category: "ciberseguridad",
  },
  {
    id: 4,
    title: "Introducción a la Inteligencia Artificial",
    description: "Conceptos básicos y aplicaciones prácticas",
    imgURL: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d",
    dateTime: "2025-12-30T11:00:00Z",
    category: "ia",
  },
  {
    id: 5,
    title: "Conferencia de Innovación Tecnológica",
    description: "Explora las últimas tendencias en tecnología e innovación.",
    imgURL: "https://images.unsplash.com/photo-1531058020387-3be344556be6",
    dateTime: "2025-11-05T15:00:00Z",
    category: "conferencias",
  },
];

let siguienteId = 6;
// ============= FUNCIONES AUXILIARES =============

// Función para validar formato ISO 8601
const validarFechaISO = (dateTime) => {
    // Expresión regular para formato ISO 8601: YYYY-MM-DDTHH:mm:ssZ o YYYY-MM-DDTHH:mm:ss.sssZ
    const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/;

    if (!isoRegex.test(dateTime)) {
        return false;
    }

    // Verificar que sea una fecha válida
    const fecha = new Date(dateTime);
    return !isNaN(fecha.getTime());
};

// Función para validar categoría
const validarCategoria = (category) => {
    return CATEGORIAS_PERMITIDAS.includes(category);
};

// ============= RUTAS CRUD =============

// READ - Obtener todas las categorías disponibles
app.get("/api/categorias", (req, res) => {
    res.json(CATEGORIAS_PERMITIDAS);
});

// READ - Obtener todos los eventos
app.get("/api/eventos", (req, res) => {
    res.json(eventos);
});

// READ - Obtener un evento por ID
app.get("/api/eventos/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const evento = eventos.find((e) => e.id === id);

    if (!evento) {
        return res.status(404).json({ error: "Evento no encontrado" });
    }

    res.json(evento);
});

// CREATE - Crear un nuevo evento
app.post("/api/eventos", (req, res) => {
    const { title, description, imgURL, dateTime, category } = req.body;

    if (!title) {
        return res.status(400).json({ error: "El título es obligatorio" });
    }

    if (!dateTime) {
        return res.status(400).json({ error: "La fecha y hora son obligatorias" });
    }

    if (!validarFechaISO(dateTime)) {
        return res.status(400).json({
            error: "Formato de fecha inválido. Use formato ISO 8601: YYYY-MM-DDTHH:mm:ssZ (ejemplo: 2025-10-16T10:00:00Z)",
        });
    }

    if (!category) {
        return res.status(400).json({
            error: "La categoría es obligatoria",
            categoriasPermitidas: CATEGORIAS_PERMITIDAS,
        });
    }

    if (!validarCategoria(category)) {
        return res.status(400).json({
            error: "Categoría no válida",
            categoriasPermitidas: CATEGORIAS_PERMITIDAS,
        });
    }

    const nuevoEvento = {
        id: siguienteId++,
        title,
        description: description || "",
        imgURL: imgURL || "",
        dateTime,
        category,
    };

    eventos.push(nuevoEvento);
    res.status(201).json(nuevoEvento);
});

// UPDATE - Actualizar un evento existente
app.put("/api/eventos/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const { title, description, imgURL, dateTime, category } = req.body;

    const indice = eventos.findIndex((e) => e.id === id);

    if (indice === -1) {
        return res.status(404).json({ error: "Evento no encontrado" });
    }

    if (dateTime !== undefined && !validarFechaISO(dateTime)) {
        return res.status(400).json({
            error: "Formato de fecha inválido. Use formato ISO 8601: YYYY-MM-DDTHH:mm:ssZ (ejemplo: 2025-10-16T10:00:00Z)",
        });
    }

    if (category !== undefined && !validarCategoria(category)) {
        return res.status(400).json({
            error: "Categoría no válida",
            categoriasPermitidas: CATEGORIAS_PERMITIDAS,
        });
    }

    // Actualizar solo los campos proporcionados
    if (title !== undefined) eventos[indice].title = title;
    if (description !== undefined) eventos[indice].description = description;
    if (imgURL !== undefined) eventos[indice].imgURL = imgURL;
    if (dateTime !== undefined) eventos[indice].dateTime = dateTime;
    if (category !== undefined) eventos[indice].category = category;

    res.json(eventos[indice]);
});

// DELETE - Eliminar un evento
app.delete("/api/eventos/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const indice = eventos.findIndex((e) => e.id === id);

    if (indice === -1) {
        return res.status(404).json({ error: "Evento no encontrado" });
    }

    const eventoEliminado = eventos.splice(indice, 1)[0];
    res.json({ mensaje: "Evento eliminado", evento: eventoEliminado });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
    console.log("\nPrueba estas rutas:");
    console.log("GET    /api/categorias   - Ver categorías disponibles");
    console.log("GET    /api/eventos      - Ver todos los eventos");
    console.log("GET    /api/eventos/:id  - Ver un evento");
    console.log("POST   /api/eventos      - Crear evento");
    console.log("PUT    /api/eventos/:id  - Actualizar evento");
    console.log("DELETE /api/eventos/:id  - Eliminar evento");
});

// {
//     "title": "Mi Evento",
//     "description": "Descripción del evento",
//     "imgURL": "https://ejemplo.com/imagen.jpg",
//     "dateTime": "2025-10-16T10:00:00Z",
//     "category": "Tecnología"
// }
