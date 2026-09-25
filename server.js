const express = require("express");
const cors = require("cors");
const path = require("path");

const db = require("./database");

const app = express();
const PORT = 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Servir archivos HTML, CSS y JS
app.use(express.static(path.join(__dirname, "public")));

// ==========================================
// GET - Obtener todas las tareas
// ==========================================

app.get("/api/tareas", (req, res) => {

    const sql = `
        SELECT *
        FROM tareas
        ORDER BY id DESC
    `;

    db.all(sql, [], (err, rows) => {

        if (err) {
            return res.status(500).json({
                error: err.message
            });
        }

        res.json(rows);
    });
});

// ==========================================
// GET - Obtener una tarea por ID
// ==========================================

app.get("/api/tareas/:id", (req, res) => {

    const id = req.params.id;

    const sql = `
        SELECT *
        FROM tareas
        WHERE id = ?
    `;

    db.get(sql, [id], (err, row) => {

        if (err) {
            return res.status(500).json({
                error: err.message
            });
        }

        if (!row) {
            return res.status(404).json({
                mensaje: "Tarea no encontrada"
            });
        }

        res.json(row);
    });
});

// ==========================================
// POST - Crear tarea
// ==========================================

app.post("/api/tareas", (req, res) => {

    const { titulo, descripcion } = req.body;

    if (!titulo || titulo.trim() === "") {
        return res.status(400).json({
            mensaje: "El título es obligatorio"
        });
    }

    const sql = `
        INSERT INTO tareas
        (titulo, descripcion, completada)
        VALUES (?, ?, 0)
    `;

    db.run(
        sql,
        [titulo.trim(), descripcion || ""],
        function (err) {

            if (err) {
                return res.status(500).json({
                    error: err.message
                });
            }

            res.status(201).json({
                id: this.lastID,
                titulo: titulo.trim(),
                descripcion: descripcion || "",
                completada: 0
            });
        }
    );
});

// ==========================================
// PUT - Actualizar tarea
// ==========================================

app.put("/api/tareas/:id", (req, res) => {

    const id = req.params.id;

    const {
        titulo,
        descripcion,
        completada
    } = req.body;

    if (!titulo || titulo.trim() === "") {
        return res.status(400).json({
            mensaje: "El título es obligatorio"
        });
    }

    const sql = `
        UPDATE tareas
        SET
            titulo = ?,
            descripcion = ?,
            completada = ?
        WHERE id = ?
    `;

    db.run(
        sql,
        [
            titulo.trim(),
            descripcion || "",
            completada ? 1 : 0,
            id
        ],
        function (err) {

            if (err) {
                return res.status(500).json({
                    error: err.message
                });
            }

            if (this.changes === 0) {
                return res.status(404).json({
                    mensaje: "Tarea no encontrada"
                });
            }

            res.json({
                mensaje: "Tarea actualizada correctamente"
            });
        }
    );
});

// ==========================================
// PATCH - Cambiar estado
// ==========================================

app.patch("/api/tareas/:id/estado", (req, res) => {

    const id = req.params.id;

    const sql = `
        UPDATE tareas
        SET completada =
            CASE
                WHEN completada = 0 THEN 1
                ELSE 0
            END
        WHERE id = ?
    `;

    db.run(sql, [id], function (err) {

        if (err) {
            return res.status(500).json({
                error: err.message
            });
        }

        if (this.changes === 0) {
            return res.status(404).json({
                mensaje: "Tarea no encontrada"
            });
        }

        res.json({
            mensaje: "Estado actualizado correctamente"
        });
    });
});

// ==========================================
// DELETE - Eliminar tarea
// ==========================================

app.delete("/api/tareas/:id", (req, res) => {

    const id = req.params.id;

    const sql = `
        DELETE FROM tareas
        WHERE id = ?
    `;

    db.run(sql, [id], function (err) {

        if (err) {
            return res.status(500).json({
                error: err.message
            });
        }

        if (this.changes === 0) {
            return res.status(404).json({
                mensaje: "Tarea no encontrada"
            });
        }

        res.json({
            mensaje: "Tarea eliminada correctamente"
        });
    });
});

// ==========================================
// Iniciar servidor
// ==========================================

app.listen(PORT, () => {

    console.log("-----------------------------------");
    console.log("Servidor iniciado correctamente");
    console.log(`http://localhost:${PORT}`);
    console.log("-----------------------------------");

});