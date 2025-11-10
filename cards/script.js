import { Temporal } from "https://esm.sh/@js-temporal/polyfill";

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
  // calcular una vez el countdown (devuelve strings ya formateados)
  const countdown = updateCountdowns(evento.dateTime);

  // Si el evento ya está vencido, marcar la tarjeta como expirado
  if (
    countdown.days === "00" &&
    countdown.hours === "00" &&
    countdown.minutes === "00" &&
    countdown.seconds === "00"
  ) {
    card.classList.add("expired");
  }

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
                <span class="countdown-value contador${evento.category}">${
    countdown.days
  }</span>
                <span class="countdown-label">Días</span>
              </div>

              <div class="countdown-item">
                <span class="countdown-value contador${evento.category}">${
    countdown.hours
  }</span>
                <span class="countdown-label">Horas</span>
              </div>

              <div class="countdown-item">
                <span class="countdown-value contador${evento.category}">${
    countdown.minutes
  }</span>

                <span class="countdown-label">Minutos</span>
              </div>

            <div class="countdown-item">
                <span class="countdown-value contador${evento.category}">${
    countdown.seconds
  }</span>
                <span class="countdown-label">Segundos</span>
            </div>
          </div>
          </div>
        </div>`;

  contenedorTodo.appendChild(card);

  setInterval(() => {
    const nuevosValores = updateCountdowns(evento.dateTime);
    card.querySelector(
      ".countdown-item .contador" + evento.category
    ).textContent = nuevosValores.days;
    card.querySelectorAll(
      ".countdown-item .contador" + evento.category
    )[1].textContent = nuevosValores.hours;
    card.querySelectorAll(
      ".countdown-item .contador" + evento.category
    )[2].textContent = nuevosValores.minutes;
    card.querySelectorAll(
      ".countdown-item .contador" + evento.category
    )[3].textContent = nuevosValores.seconds;
    // Actualizar clase expired en tiempo real
    if (
      nuevosValores.days === "00" &&
      nuevosValores.hours === "00" &&
      nuevosValores.minutes === "00" &&
      nuevosValores.seconds === "00"
    ) {
      card.classList.add("expired");
    } else {
      card.classList.remove("expired");
    }
  }, 1000);
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

function updateCountdowns(eventDate) {
  // Convertir eventDate a Instant, soportando strings con offset o ZonedDateTime
  let eventInstant;
  try {
    eventInstant = Temporal.Instant.from(eventDate);
  } catch (e) {
    try {
      eventInstant = Temporal.ZonedDateTime.from(eventDate).toInstant();
    } catch (err) {
      // Si no se puede parsear, devolvemos ceros formateados
      return { days: "00", hours: "00", minutes: "00", seconds: "00" };
    }
  }

  const zona = "Europe/Madrid";
  const ahoraZdt = Temporal.Now.zonedDateTimeISO(zona);
  const ahoraInstant = ahoraZdt.toInstant();

  // Si el evento ya pasó, devolvemos ceros
  if (eventInstant.epochMilliseconds <= ahoraInstant.epochMilliseconds) {
    return { days: "00", hours: "00", minutes: "00", seconds: "00" };
  }

  // Convertir ambos a ZonedDateTime en la misma zona para poder usar 'days'
  const eventZdt = eventInstant.toZonedDateTimeISO(zona);
  const diferencia = eventZdt.since(ahoraZdt, {
    largestUnit: "days",
    smallestUnit: "seconds",
  });

  // Obtener componentes y asegurar enteros
  const days = Math.floor(diferencia.days || 0);
  const hours = Math.floor(diferencia.hours || 0);
  const minutes = Math.floor(diferencia.minutes || 0);
  const seconds = Math.floor(diferencia.seconds || 0);

  // Devolver strings con relleno de 2 dígitos
  return {
    days: String(days).padStart(2, "0"),
    hours: String(hours).padStart(2, "0"),
    minutes: String(minutes).padStart(2, "0"),
    seconds: String(seconds).padStart(2, "0"),
  };
}
