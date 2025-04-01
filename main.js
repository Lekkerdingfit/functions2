let map, marker, uvCircle;

window.initMap = function () {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 0, lng: 0 },
    zoom: 2,
  });
};

async function searchLocation() {
  const location = document.getElementById("locationInput").value;
  if (!location) return;

  const openCageKey = "00df02b1a18849ab9c07fce3a53de1e7";

  // Get coordinates from OpenCage
  const geoRes = await fetch(`https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(location)}&key=${openCageKey}`);
  const geoData = await geoRes.json();
  if (!geoData.results.length) {
    document.getElementById("uvInfo").innerText = "Location not found.";
    return;
  }

  const { lat, lng } = geoData.results[0].geometry;

  // Get UV data from Open-Meteo
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

  function getUVColor(uv) {
    if (uv < 3) return '#4caf50';      // Green - Low
    if (uv < 6) return '#ffeb3b';      // Yellow - Moderate
    if (uv < 8) return '#ff9800';      // Orange - High
    return '#f44336';                  // Red - Very High
  }

  if (!map) {
    map = new google.maps.Map(document.getElementById("map"), {
      center: { lat, lng },
      zoom: 10,
    });
  } else {
    map.setCenter({ lat, lng });
  }

  if (marker) marker.setMap(null);
  if (uvCircle) uvCircle.setMap(null);

  marker = new google.maps.Marker({
    position: { lat, lng },
    map: map,
    title: location,
  });

  if (typeof currentUV !== "undefined") {
    uvCircle = new google.maps.Circle({
      strokeColor: getUVColor(currentUV),
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: getUVColor(currentUV),
      fillOpacity: 0.35,
      map: map,
      center: { lat, lng },
      radius: 30000,
    });
  }

  let html = `<strong>Current UV in ${location}: <span style="color: ${getUVColor(currentUV)}">${currentUV?.toFixed(1) ?? 'N/A'}</span></strong><br><br>`;
  html += `<strong>Today’s Hourly UV Forecast:</strong><br>`;

  for (let i = 0; i < 24 && i < uvValues.length; i++) {
    const uv = uvValues[i];
    const time = times[i].replace("T", " ");
    const bg = getUVColor(uv);
    html += `
      <div style="background-color: ${bg}; color: black; padding: 4px; margin: 2px; border-radius: 4px;">
        ${time} → <strong>${uv}</strong>
      </div>`;
  }

  document.getElementById("uvInfo").innerHTML = html;
}
