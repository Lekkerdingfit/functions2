// I needed to convert coordinates into readble place names
// I found this API: https://opencagedata.com/api
//I used it to display the name of my current location.”
const openCageKey = "00df02b1a18849ab9c07fce3a53de1e7";

let currentTimes = [], currentUVs = [];

// I wanted to visualize UV levels using toast colors
// I referred to WHO's UV index scale: https://www.who.int/news-room/questions-and-answers/item/radiation-the-ultraviolet-(uv)-index
// I customized hex values to match toast brwoning stages
function getUVColor(uv){
  if (uv < 2) return '#fff8dc';
  if (uv < 4) return '#f5deb3';
  if (uv < 6) return '#d2b48c';
  if (uv < 8) return '#a0522d';
  if (uv < 10) return '#a0522d';
  return '#3e2723';
}

// I wanted toast visual to match UV levels exactly
// I mapped UV ranges to PNG files (from lightest to burnt)
// Inspired by: https://www.uvlens.com/ > gave me more ideas from this website
function getToastImage(uv) {
  if (uv < 2) return "toast1.png";
  if (uv < 4) return "toast2.png";
  if (uv < 6) return "toast3.png";
  if (uv < 8) return "toast4.png";
  if (uv < 10) return "toast5.png";
  return "toast6.png";
}

// I wanted users to get their UV level by current location
// I used Geolocation API: https://developer.mozilla.org/en-US/docs/Web/API/Geolocation/getCurrentPosition
// I used it to display the name of my current location
function getMyLocation() {
  if (!navigator.geolocation) return alert("Geolocation not supported.");

  navigator.geolocation.getCurrentPosition(async (pos) => {
    const lat = pos.coords.latitude;
    const lng = pos.coords.longitude;

    // showing the name of my location: https://opencagedata.com/api
    const res = await fetch(`https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lng}&key=${openCageKey}`);
    const data = await res.json();
    const place = data.results[0]?.formatted || "Your Location";

   
    const locationDisplay = document.getElementById("locationInfo");
    locationDisplay.innerText = `📍 ${place}`;

    fetchUVData(lat, lng);
  });
}

// I needed live UV data for the current day
// I found this weather API: https://open-meteo.com/en/docs
// It gives hourly UV Index values based on location
async function fetchUVData(lat, lng) {
  const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&hourly=uv_index&timezone=auto`);
  const data = await res.json();

  const allTimes = data.hourly?.time || [];
  const allUVs = data.hourly?.uv_index || [];
  const today = new Date().toISOString().slice(0, 10);

  currentTimes = [], currentUVs = [];
  allTimes.forEach((t, i) => {
    if (t.startsWith(today)) {
      currentTimes.push(t);
      currentUVs.push(allUVs[i]);
    }
  });

  if (!currentTimes.length) {
    document.getElementById("uvResultBox").innerText = "No UV data available.";
    return;
  }

  populateHourSelect(currentTimes);
  document.getElementById("hourFilter").style.display = "block";
}

// I wanted users to pick a time for forcast
// I created 'select' options dynamically from filtered times
// Time slicing from ISO format, I found it here: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date)

function populateHourSelect(times) {
  const select = document.getElementById("hourSelect");
  select.innerHTML = `<option value="">-- choose hour --</option>`;
  times.forEach((t, i) => {
    const hour = t.slice(11, 16);
    select.appendChild(new Option(hour, i));
  });
}

// I combined color,image, and text to show UV results clearly
// Inspired by playful metaphors like 'toast level' to represent sunburrn risk
function showSelectedHourUV() {
  const i = document.getElementById("hourSelect").value;
  const box = document.getElementById("uvResultBox");
  if (i === "") return (box.style.display = "none");

  const uv = currentUVs[i];
  const time = currentTimes[i].replace("T", " ");
  const bg = getUVColor(uv);
  const img = getToastImage(uv);

  // I wanted to show the UV result clearly
  // I just updated the backgroun, image, and text using simple DOM methods
  // Inspired from: https://developer.mozilla.org/en-US/docs/Web/API/Document/getElementById
  box.style.display = "block";
  box.style.backgroundColor = bg;
  document.getElementById("toastImage").src = `assets/${img}`;
  document.getElementById("toastUV").innerText = `UV Index: ${uv}`;
  document.getElementById("toastTime").innerText = time;
  updateUVIcons(uv);
}

  // I needed a simple toggle to show/hide UV index info
  // Pure JS DOM toggle for visual legend section
  function toggleLegend() {
    const legend = document.getElementById("legend");
    legend.style.display = legend.style.display === "none" ? "block" : "none";
  }

  //  I wanted to show recommended sun protection items such as sunglasses and suncream based on UV level
  //  I found this code in here:https://developer.mozilla.org/en-US/docs/Web/API/Element/classList
  //  I found this code in here:https://developer.mozilla.org/en-US/docs/Web/API/setTimeout
  //  I found that UV thresholds are based on WHO guideline
function updateUVIcons(uvIndex){
  const sunglassesIcon = document.getElementById('sunglassesIcon');
  const suncreamIcon = document.getElementById('suncreamIcon');

  [sunglassesIcon, suncreamIcon].forEach(icon => {
    icon.classList.remove('show');
    icon.classList.add('hidden');
  });

  if (uvIndex >= 3) {
    sunglassesIcon.classList.remove('hidden');
    setTimeout(() => sunglassesIcon.classList.add('show'), 100);
  }
  if (uvIndex >= 4) {
    suncreamIcon.classList.remove('hidden');
    setTimeout(() => suncreamIcon.classList.add('show'), 100);
  }

}


  // Modal interaction for explaning UV levels
  // Custom modal UI with basic click-outside to close
  function openLegendModal(){
    document.getElementById("legendModal").style.display = "block";
  }

  function closeLegendModal(){
    document.getElementById("legendModal").style.display = "none";
  }
  
  window.onclick = function(event) {
    const modal = document.getElementById("legendModal");
    if (event.target === modal) {modal.style.display = "none";

    }
  };