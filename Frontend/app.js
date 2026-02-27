const API_URL = "http://localhost:3000/todos";

const inputTarea = document.getElementById("inputTarea");
const btnAgregar = document.getElementById("btnAgregar");
const listaTareas = document.getElementById("listaTareas");
const contadorPendientes = document.getElementById("contadorPendientes");
const botonesFiltro = document.querySelectorAll(".btn-filtro");
const btnMarcarTodas = document.getElementById("btnMarcarTodas");

let filtroActual = "todas";

document.addEventListener("DOMContentLoaded", cargarTareas);

btnAgregar.addEventListener("click", agregarTarea);
btnMarcarTodas.addEventListener("click", async () => {

  const res = await fetch(API_URL);
  const tareas = await res.json();

  for (let tarea of tareas) {
    if (tarea.completed === 0) {
      await fetch(`${API_URL}/${tarea.id}/toggle`, {
        method: "PATCH"
      });
    }
  }

  cargarTareas();
});

inputTarea.addEventListener("keypress", e => {
  if (e.key === "Enter") agregarTarea();
});

botonesFiltro.forEach(boton => {
  boton.addEventListener("click", () => {
    botonesFiltro.forEach(b => b.classList.remove("active"));
    boton.classList.add("active");
    filtroActual = boton.dataset.filtro;
    cargarTareas();
  });
});

async function cargarTareas() {
  const res = await fetch(API_URL);
  let tareas = await res.json();

  if (filtroActual === "pendientes") {
    tareas = tareas.filter(t => t.completed === 0);
  }

  if (filtroActual === "completadas") {
    tareas = tareas.filter(t => t.completed === 1);
  }

  renderizarTareas(tareas);
}

function renderizarTareas(tareas) {
  listaTareas.innerHTML = "";
  let pendientes = 0;

  tareas.forEach(tarea => {

    if (tarea.completed === 0) pendientes++;

    const li = document.createElement("li");

      if (tarea.completed === 0) {
      li.classList.add("pendiente");
    } else {
      li.classList.add("completada-item");
    }

    li.innerHTML = `
      <input type="checkbox" ${tarea.completed ? "checked" : ""}>
      <span class="${tarea.completed ? "completada" : ""}">
        ${tarea.title}
      </span>
      <button class="btn-editar">✏️</button>
      <button class="btn-eliminar">❌</button>
    `;

    // ✅ Toggle
    li.querySelector("input").addEventListener("change", async () => {
      await fetch(`${API_URL}/${tarea.id}/toggle`, {
        method: "PATCH"
      });
      cargarTareas();
    });

    // ❌ Eliminar
    li.querySelector(".btn-eliminar").addEventListener("click", async () => {
      await fetch(`${API_URL}/${tarea.id}`, {
        method: "DELETE"
      });
      cargarTareas();
    });

    // ✏️ Editar
    li.querySelector(".btn-editar").addEventListener("click", () => {

      const span = li.querySelector("span");
      const input = document.createElement("input");
      input.type = "text";
      input.value = tarea.title;

      li.replaceChild(input, span);
      input.focus();

      input.addEventListener("blur", async () => {
        const nuevoTexto = input.value.trim();
        if (!nuevoTexto) {
          cargarTareas();
          return;
        }

        await fetch(`${API_URL}/${tarea.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: nuevoTexto })
        });

        cargarTareas();
      });

      input.addEventListener("keypress", async (e) => {
        if (e.key === "Enter") {
          input.blur();
        }
      });
    });

    listaTareas.appendChild(li);
  });

  contadorPendientes.textContent = `${pendientes} tareas pendientes`;
}

async function agregarTarea() {
  const texto = inputTarea.value.trim();
  if (!texto) return;

  await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: texto })
  });

  inputTarea.value = "";
  cargarTareas();
}