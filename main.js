// API key connect 
const openCageKey = "00df02b1a18849ab9c07fce3a53de1e7";

let currentTimes = [];
let currentUVs = [];

//fully understand this part based on thue UV number
function getUVColor(uv) {
  if (uv < 2) return '#fff8dc'; // Very ligth toast
  if (uv < 4) return '#f5deb3'; // Light golden
  if (uv < 6) return '#d2b48c'; // Toasted
  if (uv < 8) return '#a0522d'; // Dark Toasted
  if(uv<10) return '#a0522d'; // Very Dark
  return '#3e2723';             // Burnt
}

// match with upper code with PNG file! 
function getToastImage(uv) {
  if (uv < 1) return "toast1.png";
  if (uv < 3) return "toast2.png";
  if (uv < 5) return "toast3.png";
  if (uv < 7) return "toast4.png";
  if (uv < 9) return "toast5.png";
  return "toast6.png";
}

async function searchLocation() {
  const location = document.getElementById("locationInput").value;
  if (!location) return;

  const geoRes = await fetch(`https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(location)}&key=${openCageKey}`);
  const geoData = await geoRes.json();
  if (!geoData.results.length) {
    document.getElementById("uvResultBox").innerText = "Location not found.";
    return;
  }

  const { lat, lng } = geoData.results[0].geometry;
  await fetchUVData(lat, lng, "today");
}

function getMyLocation() {
  if (!navigator.geolocation) {
    alert("Geolocation is not supported.");
    return;
  }

  navigator.geolocation.getCurrentPosition(async (position) => {
    const lat = position.coords.latitude;
    const lng = position.coords.longitude;
    await fetchUVData(lat, lng, "today");
  });
}

async function showTomorrowUV() {
  const location = document.getElementById("locationInput").value;
  if (!location) return;

  const geoRes = await fetch(`https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(location)}&key=${openCageKey}`);
  const geoData = await geoRes.json();
  if (!geoData.results.length) {
    document.getElementById("uvResultBox").innerText = "Location not found.";
    return;
  }

  const { lat, lng } = geoData.results[0].geometry;
  await fetchUVData(lat, lng, "tomorrow");
}

// API connect with open-meteo, they give current and tomorrow UV information lively
async function fetchUVData(lat, lng, day = "today") {
  const meteoURL = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&hourly=uv_index&timezone=auto`;
  const weatherRes = await fetch(meteoURL);
  const weatherData = await weatherRes.json();

  const allTimes = weatherData.hourly?.time || [];
  const allUVs = weatherData.hourly?.uv_index || [];

  let dateToUse = new Date();
  if (day === "tomorrow") {
    dateToUse.setDate(dateToUse.getDate() + 1);
  }

  const dateStr = dateToUse.toISOString().slice(0, 10);

  // Filter times/UVs by selected date
  currentTimes = [];
  currentUVs = [];
  for (let i = 0; i < allTimes.length; i++) {
    if (allTimes[i].startsWith(dateStr)) {
      currentTimes.push(allTimes[i]);
      currentUVs.push(allUVs[i]);
    }
  }

  if (!currentTimes.length) {
    document.getElementById("uvResultBox").innerText = "No UV data available.";
    return;
  }

  populateHourSelect(currentTimes);
  document.getElementById("hourFilter").style.display = "block";
}

function populateHourSelect(times) {
  const hourSelect = document.getElementById("hourSelect");
  hourSelect.innerHTML = `<option value="">-- choose hour --</option>`;
  times.forEach((time, i) => {
    const hour = time.slice(11, 16); // "HH:MM"
    const option = document.createElement("option");
    option.value = i;
    option.text = hour;
    hourSelect.appendChild(option);
  });
}

// information box toggle function > totally understand this function 
function toggleLegend() {
  const legend = document.getElementById("legend");
  legend.style.display = legend.style.display === "none" ? "block" : "none";
}

function showSelectedHourUV() {
  const index = document.getElementById("hourSelect").value;
  const box = document.getElementById("uvResultBox");

  if (index === "") {
    box.innerHTML = "";
    return;
  }

  const uv = currentUVs[index];
  const time = currentTimes[index].replace("T", " ");
  const bg = getUVColor(uv);
  const img = getToastImage(uv);

  box.innerHTML = `
    <div style="background-color: ${bg}; color: black; padding: 16px; border-radius: 10px;">
      <img src="assets/${img}" alt="UV Toast">

      <div><strong>${time}</strong></div>
      <div>UV Index: <strong>${uv}</strong></div>
    </div>
  `;
}