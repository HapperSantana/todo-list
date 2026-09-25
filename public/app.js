const API = "/api/tareas";


// ==========================================
// Cargar tareas
// ==========================================

async function cargarTareas() {

    try {

        const respuesta = await fetch(API);

        const tareas = await respuesta.json();

        mostrarTareas(tareas);

    } catch (error) {

        console.error("Error:", error);

    }

}


// ==========================================
// Mostrar tareas
// ==========================================

function mostrarTareas(tareas) {

    const contenedor =
        document.getElementById("listaTareas");

    contenedor.innerHTML = "";

    // Estadísticas

    const total = tareas.length;

    const completadas =
        tareas.filter(tarea => tarea.completada === 1).length;

    const pendientes = total - completadas;

    document.getElementById("totalTareas").textContent = total;

    document.getElementById("pendientes").textContent =
        pendientes;

    document.getElementById("completadas").textContent =
        completadas;


    // Sin tareas

    if (tareas.length === 0) {

        contenedor.innerHTML = `
            <div class="text-center py-4">

                <h4>📭</h4>

                <p class="text-muted">
                    No tienes tareas registradas.
                </p>

            </div>
        `;

        return;
    }


    // Mostrar tareas

    tareas.forEach(tarea => {

        const completada =
            tarea.completada === 1;


        const div =
            document.createElement("div");


        div.className =
            "border rounded p-3 mb-3";


        div.innerHTML = `

            <div class="d-flex justify-content-between
                        align-items-start">

                <div class="flex-grow-1">

                    <h5 class="${completada
                        ? "text-decoration-line-through text-muted"
                        : ""}">

                        ${escapeHTML(tarea.titulo)}

                    </h5>

                    <p class="text-muted mb-2">

                        ${escapeHTML(
                            tarea.descripcion || "Sin descripción"
                        )}

                    </p>

                    <span class="badge ${
                        completada
                        ? "bg-success"
                        : "bg-warning text-dark"
                    }">

                        ${
                            completada
                            ? "Completada"
                            : "Pendiente"
                        }

                    </span>

                </div>


                <div class="ms-3">

                    <button
                        class="btn btn-sm btn-success mb-1"
                        onclick="cambiarEstado(${tarea.id})"
                        title="Cambiar estado"
                    >
                        ✓
                    </button>

                    <button
                        class="btn btn-sm btn-primary mb-1"
                        onclick="editarTarea(${tarea.id})"
                        title="Editar"
                    >
                        ✏️
                    </button>

                    <button
                        class="btn btn-sm btn-danger mb-1"
                        onclick="eliminarTarea(${tarea.id})"
                        title="Eliminar"
                    >
                        🗑️
                    </button>

                </div>

            </div>

        `;


        contenedor.appendChild(div);

    });

}


// ==========================================
// Agregar tarea
// ==========================================

document
    .getElementById("formTarea")
    .addEventListener("submit", async function (event) {

        event.preventDefault();


        const titulo =
            document.getElementById("titulo").value;

        const descripcion =
            document.getElementById("descripcion").value;


        try {

            const respuesta = await fetch(API, {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    titulo,
                    descripcion
                })

            });


            if (!respuesta.ok) {

                const error = await respuesta.json();

                alert(error.mensaje);

                return;

            }


            document
                .getElementById("formTarea")
                .reset();


            await cargarTareas();


        } catch (error) {

            console.error("Error:", error);

        }

    });


// ==========================================
// Cambiar estado
// ==========================================

async function cambiarEstado(id) {

    try {

        await fetch(`${API}/${id}/estado`, {

            method: "PATCH"

        });

        cargarTareas();

    } catch (error) {

        console.error("Error:", error);

    }

}


// ==========================================
// Editar tarea
// ==========================================

async function editarTarea(id) {

    try {

        const respuesta =
            await fetch(`${API}/${id}`);

        const tarea =
            await respuesta.json();


        document.getElementById("editarId").value =
            tarea.id;

        document.getElementById("editarTitulo").value =
            tarea.titulo;

        document.getElementById("editarDescripcion").value =
            tarea.descripcion || "";


        const modal =
            new bootstrap.Modal(
                document.getElementById("modalEditar")
            );


        modal.show();

    } catch (error) {

        console.error("Error:", error);

    }

}


// ==========================================
// Guardar edición
// ==========================================

async function guardarEdicion() {

    const id =
        document.getElementById("editarId").value;

    const titulo =
        document.getElementById("editarTitulo").value;

    const descripcion =
        document.getElementById("editarDescripcion").value;


    if (titulo.trim() === "") {

        alert("El título es obligatorio");

        return;

    }


    try {

        // Primero obtenemos la tarea
        // para conservar su estado actual

        const respuesta =
            await fetch(`${API}/${id}`);

        const tarea =
            await respuesta.json();


        await fetch(`${API}/${id}`, {

            method: "PUT",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({

                titulo,
                descripcion,

                completada:
                    tarea.completada === 1

            })

        });


        const modalElement =
            document.getElementById("modalEditar");


        const modal =
            bootstrap.Modal.getInstance(modalElement);


        modal.hide();


        cargarTareas();


    } catch (error) {

        console.error("Error:", error);

    }

}


// ==========================================
// Eliminar tarea
// ==========================================

async function eliminarTarea(id) {

    const confirmar =
        confirm(
            "¿Estás seguro de eliminar esta tarea?"
        );


    if (!confirmar) {
        return;
    }


    try {

        const respuesta =
            await fetch(`${API}/${id}`, {

                method: "DELETE"

            });


        if (!respuesta.ok) {

            const error =
                await respuesta.json();

            alert(error.mensaje);

            return;

        }


        cargarTareas();


    } catch (error) {

        console.error("Error:", error);

    }

}


// ==========================================
// Evitar inyección HTML
// ==========================================

function escapeHTML(texto) {

    const div =
        document.createElement("div");

    div.textContent = texto;

    return div.innerHTML;

}


// ==========================================
// Inicializar
// ==========================================

cargarTareas();