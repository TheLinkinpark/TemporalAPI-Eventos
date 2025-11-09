// script.js
// - Obtiene eventos desde http://localhost:3000/api/eventos
// - Renderiza las cards en .cards-container
// - Usa Temporal API para parsear/formatar fechas cuando esté disponible (con fallback)
// - Añade un countdown actualizado cada segundo

document.addEventListener("DOMContentLoaded", () => {
  const container = document.querySelector(".cards-container");
  if (!container) return;

  fetchAndRenderEvents(container);
});

async function fetchAndRenderEvents(container) {
  const API = "http://localhost:3000/api/eventos";

  try {
    const res = await fetch(API);
    if (!res.ok) throw new Error("HTTP " + res.status + " - " + res.statusText);
    const eventos = await res.json();

    if (!Array.isArray(eventos) || eventos.length === 0) {
      container.innerHTML = "<p>No hay eventos disponibles.</p>";
      return;
    }

    // Limpiar container
    container.innerHTML = "";

    eventos.forEach((ev) => {
      const cardEl = buildCard(ev);
      container.appendChild(cardEl);
    });
  } catch (err) {
    console.error("Error trayendo eventos:", err);
    container.innerHTML =
      '<p class="error">No se pudieron cargar los eventos: ' +
      escapeHtml(err.message) +
      "</p>";
  }
}

function buildCard(evento) {
  const {
    title = "Sin título",
    description = "",
    imgURL = "",
    dateTime,
    category = "General",
  } = evento;

  const card = document.createElement("div");
  card.className = "card";

  const img = document.createElement("img");
  img.className = "card-img";
  img.alt = title;
  img.src = imgURL || "https://via.placeholder.com/800x450?text=Sin+imagen";

  const content = document.createElement("div");
  content.className = "card-content-container";

  const spanCat = document.createElement("span");
  spanCat.className = "category " + cssSafe(category);
  spanCat.textContent = category;

  const h2 = document.createElement("h2");
  h2.className = "card-title";
  h2.textContent = title;

  const p = document.createElement("p");
  p.className = "card-subtitle";
  p.textContent = description;

  const eventDateDiv = document.createElement("div");
  eventDateDiv.className = "event-date";
  const calImg = document.createElement("img");
  calImg.src = "./img/calendar-icon.svg";
  calImg.alt = "calendar";
  const dateSpan = document.createElement("span");
  dateSpan.textContent = dateTime
    ? formatDateTemporal(dateTime)
    : "Fecha no disponible";
  eventDateDiv.appendChild(calImg);
  eventDateDiv.appendChild(dateSpan);

  // Countdown area
  const countdownArea = document.createElement("div");
  countdownArea.className = "countdown-area";

  const daysItem = makeCountdownItem("Días");
  const hoursItem = makeCountdownItem("Horas");
  const minsItem = makeCountdownItem("Minutos");
  const secsItem = makeCountdownItem("Segundos");

  countdownArea.appendChild(daysItem.container);
  countdownArea.appendChild(hoursItem.container);
  countdownArea.appendChild(minsItem.container);
  countdownArea.appendChild(secsItem.container);

  content.appendChild(spanCat);
  content.appendChild(h2);
  content.appendChild(p);
  content.appendChild(eventDateDiv);
  content.appendChild(countdownArea);

  card.appendChild(img);
  card.appendChild(content);

  // Start the countdown (if dateTime provided)
  if (dateTime) {
    startCountdown(dateTime, {
      days: daysItem.valueEl,
      hours: hoursItem.valueEl,
      minutes: minsItem.valueEl,
      seconds: secsItem.valueEl,
      container: countdownArea,
    });
  } else {
    // Hide countdown if no date
    countdownArea.style.display = "none";
  }

  return card;
}

function makeCountdownItem(labelText) {
  const item = document.createElement("div");
  item.className = "countdown-item";

  const value = document.createElement("span");
  value.className = "countdown-value";
  value.textContent = "00";

  const label = document.createElement("span");
  label.className = "countdown-label";
  label.textContent = labelText;

  item.appendChild(value);
  item.appendChild(label);

  return { container: item, valueEl: value };
}

function startCountdown(isoString, els) {
  // els: { days, hours, minutes, seconds, container }

  function getEpochMs(iso) {
    if (window.Temporal && Temporal.Instant) {
      try {
        return Temporal.Instant.from(iso).epochMilliseconds;
      } catch (e) {
        // fallthrough
      }
    }
    const d = new Date(iso);
    return d.getTime();
  }

  function update() {
    const nowMs =
      window.Temporal && Temporal.Now && Temporal.Now.instant
        ? Temporal.Now.instant().epochMilliseconds
        : Date.now();

    const targetMs = getEpochMs(isoString);
    let diff = targetMs - nowMs;

    if (isNaN(targetMs)) {
      els.container.textContent = "Fecha inválida";
      return;
    }

    if (diff <= 0) {
      // Evento ya pasó
      els.days.textContent = "00";
      els.hours.textContent = "00";
      els.minutes.textContent = "00";
      els.seconds.textContent = "00";
      return;
    }

    const seconds = Math.floor(diff / 1000) % 60;
    const minutes = Math.floor(diff / (1000 * 60)) % 60;
    const hours = Math.floor(diff / (1000 * 60 * 60)) % 24;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    els.days.textContent = String(days).padStart(2, "0");
    els.hours.textContent = String(hours).padStart(2, "0");
    els.minutes.textContent = String(minutes).padStart(2, "0");
    els.seconds.textContent = String(seconds).padStart(2, "0");
  }

  // Primera actualización y luego cada segundo
  update();
  const id = setInterval(update, 1000);
  return id;
}

function formatDateTemporal(iso) {
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  if (window.Temporal && Temporal.Instant) {
    try {
      const zoned = Temporal.Instant.from(iso).toZonedDateTimeISO(tz);
      const weekdayNames = [
        "Domingo",
        "Lunes",
        "Martes",
        "Miércoles",
        "Jueves",
        "Viernes",
        "Sábado",
      ];
      const weekday = weekdayNames[(zoned.dayOfWeek ?? 0) % 7];
      const day = String(zoned.day).padStart(2, "0");
      const month = String(zoned.month).padStart(2, "0");
      const year = String(zoned.year).slice(-2);
      const hour = String(zoned.hour).padStart(2, "0");
      const minute = String(zoned.minute).padStart(2, "0");
      return (
        weekday +
        ", " +
        day +
        "/" +
        month +
        "/" +
        year +
        " - " +
        hour +
        ":" +
        minute
      );
    } catch (e) {
      // fallthrough to Intl fallback
    }
  }

  // Fallback usando Intl (si Temporal no está disponible o parsing falla)
  try {
    const d = new Date(iso);
    const options = {
      weekday: "long",
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: tz,
    };
    const formatted = new Intl.DateTimeFormat("es-ES", options).format(d);
    return formatted;
  } catch (e) {
    return iso;
  }
}

function cssSafe(text) {
  return String(text)
    .toLowerCase()
    .replace(/[^a-z0-9\-]/g, "-");
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
