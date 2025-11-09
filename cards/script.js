//import { Temporal } from "https://cdn.jsdelivr.net/npm/@js-temporal/polyfill@0.4.4/+esm";

document.addEventListener("DOMContentLoaded", () => {
  fetchEventos();
});

function fetchEventos() {
  fetch("http://localhost:3000/api/eventos")
    .then((response) => response.json())
    .then((eventos) => {
      eventos.forEach((evento) => {
        createCards(evento);
      });

      console.log(eventos);
    })
    .catch((error) => {
      console.error("Error al obtener eventos:", error);
    });
}

function createCards(evento) {
  const contenedorTodo = document.querySelector(".cards-container");

  const card = document.createElement("div");
  card.classList.add("card");

  card.innerHTML = `
            <img src="${evento.imgURL}" alt="gr" class="card-img"/>
          <div class="card-content-container">
            <span class="category ${evento.category}">${evento.category}</span>
            <h2 class="card-title">${evento.title}</h2>
            <p class="card-subtitle">${evento.description}</p>
            <div class="event-date">
              <img src="./img/calendar-icon.svg"/>
              <span>${formatEventTime(evento.dateTime)}</span>
            </div>

            <div class="countdown-area">
              <div class="countdown-item">
                <span class="countdown-value contador${evento.category}">00</span>
                <span class="countdown-label">Días</span>
              </div>

              <div class="countdown-item">
                <span class="countdown-value contador${evento.category}">00</span>
                <span class="countdown-label">Horas</span>
              </div>

              <div class="countdown-item">
                <span class="countdown-value contador${evento.category}">00</span>
                <span class="countdown-label">Minutos</span>
              </div>

            <div class="countdown-item">
                <span class="countdown-value contador${evento.category}">00</span>
                <span class="countdown-label">Segundos</span>
            </div>
          </div>
          </div>
        </div>`;

  contenedorTodo.appendChild(card);
}

function formatEventTime(dateTime) {
  if (!dateTime) return "Fecha no disponible";
  const date = new Date(dateTime);
  const options = {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  };
  return date.toLocaleDateString("es-ES", options).replace(",", " -");
}

function updateCountdowns() {
  
}
