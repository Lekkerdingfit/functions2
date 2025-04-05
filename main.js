const openCageKey = "00df02b1a18849ab9c07fce3a53de1e7";

function getUVColor(uv) {
  if (uv < 3) return '#fff8dc'; // Very ligth toast
  if (uv < 6) return '#f5deb3'; // Light golden
  if (uv < 8) return '#d2b48c'; // Toasted
  if(uv<10) return '#a0522d'; //Dark Toast
  return '#3e2723';             // Burnt
}

async function searchLocation() {
  const location = document.getElementById("locationInput").value;
  if (!location) return;

  const geoRes = await fetch(`https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(location)}&key=${openCageKey}`);
  const geoData = await geoRes.json();
  if (!geoData.results.length) {
    document.getElementById("uvInfo").innerText = "Location not found.";
    return;
  }

  const { lat, lng } = geoData.results[0].geometry;
  displayUVData(lat, lng, location);
}

function getMyLocation() {
  if (!navigator.geolocation) {
    alert("Geolocation is not supported.");
    return;
  }

  navigator.geolocation.getCurrentPosition((position) => {
    const lat = position.coords.latitude;
    const lng = position.coords.longitude;
    displayUVData(lat, lng, "your location");
  });
}

async function displayUVData(lat, lng, label) {
  const meteoURL = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&hourly=uv_index&timezone=auto`;
  const weatherRes = await fetch(meteoURL);
  const weatherData = await weatherRes.json();

  const times = weatherData.hourly?.time;
  const uvValues = weatherData.hourly?.uv_index;
  if (!times || !uvValues) {
    document.getElementById("uvInfo").innerText = "UV data not available.";
    return;
  }

  const now = new Date();
  const isoHour = now.toISOString().slice(0, 13);
  const index = times.findIndex(t => t.startsWith(isoHour));
  const currentUV = uvValues[index];

  let html = `<strong>How Toasty is ${label} Right Now?: <span style="color: ${getUVColor(currentUV)}">${currentUV?.toFixed(1) ?? 'N/A'}</span></strong><br><br>`;
  html += `<strong>Today's Hourly 🍞 Toast Level 🍞:</strong><br>`;

  for (let i = 0; i < 24 && i < uvValues.length; i++) {
    const uv = uvValues[i];
    const time = times[i].replace("T", " ");
    const bg = getUVColor(uv);
    html += `
      <div style="background-color: ${bg}; color: black; padding: 5px; margin: 3px; border-radius: 4px;">
        ${time} → <strong>${uv}</strong>
      </div>`;
  }

  document.getElementById("uvInfo").innerHTML = html;
}

async function showTomorrowUV() {
  const location = document.getElementById("locationInput").value;
  if (!location) return;

  const geoRes = await fetch(`https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(location)}&key=${openCageKey}`);
  const geoData = await geoRes.json();
  if (!geoData.results.length) {
    document.getElementById("uvInfo").innerText = "Location not found.";
    return;
  }

  const { lat, lng } = geoData.results[0].geometry;

  const meteoURL = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&hourly=uv_index&timezone=auto`;
  const weatherRes = await fetch(meteoURL);
  const weatherData = await weatherRes.json();

  const times = weatherData.hourly?.time;
  const uvValues = weatherData.hourly?.uv_index;

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dateStr = tomorrow.toISOString().slice(0, 10);

  let html = `<strong>Tomorrow (${dateStr}) 🍞 Toast Level:</strong><br>`;

  for (let i = 0; i < times.length; i++) {
    if (times[i].startsWith(dateStr)) {
      const uv = uvValues[i];
      const time = times[i].replace("T", " ");
      const bg = getUVColor(uv);
      html += `
        <div style="background-color: ${bg}; color: black; padding: 4px; margin: 2px; border-radius: 4px;">
          ${time} → <strong>${uv}</strong>
        </div>`;
    }
  }

  document.getElementById("uvInfo").innerHTML = html;
}
