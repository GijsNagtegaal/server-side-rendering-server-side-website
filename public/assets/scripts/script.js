const parkConfig = {
    top: 52.352241,    
    bottom: 52.351463, 
    left: 4.930507,    
    right: 4.931358,
    buffer: 0.0005
};

let offset = { lat: 0, lon: 0 };
let isCalibrated = false;

function updateUI(lat, lon) {
    const pin = document.getElementById('user-location-pin');
    if (!pin) return;

    // Apply Offset (Your "Home" position translated to "Park Center")
    const mapLat = lat + offset.lat;
    const mapLon = lon + offset.lon;

    // Geofence Exit Check
    const isOutside = 
        mapLat > (parkConfig.top + parkConfig.buffer) || 
        mapLat < (parkConfig.bottom - parkConfig.buffer) ||
        mapLon < (parkConfig.left - parkConfig.buffer) || 
        mapLon > (parkConfig.right + parkConfig.buffer);

    if (isOutside && isCalibrated) {
        console.log("Exited park bounds. Redirecting...");
        window.location.href = '/'; 
        return;
    }

    // Coordinate Mapping (Lerp)
    // Lon -> X (left to right)
    let xPct = (mapLon - parkConfig.left) / (parkConfig.right - parkConfig.left);
    // Lat -> Y (top to bottom). North (Top) is a higher number, so we subtract from Top.
    let yPct = (parkConfig.top - mapLat) / (parkConfig.top - parkConfig.bottom);

    // Update Pin (using 0-100%)
    pin.style.left = `${xPct * 100}%`;
    pin.style.top = `${yPct * 100}%`;

    // Scroll to Pin
    pin.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function calibrateHome(currentLat, currentLon) {
    // We want the starting "mapLat" to be the exact midpoint of the park
    const parkCenterLat = (parkConfig.top + parkConfig.bottom) / 2;
    const parkCenterLon = (parkConfig.left + parkConfig.right) / 2;

    offset.lat = parkCenterLat - currentLat;
    offset.lon = parkCenterLon - currentLon;
    
    isCalibrated = true;
    console.log("Calibrated! Your living room is now the center of the park.");
}

navigator.geolocation.watchPosition((pos) => {
    const { latitude, longitude } = pos.coords;

    if (!isCalibrated) {
        calibrateHome(latitude, longitude);
    }

    updateUI(latitude, longitude);
}, (err) => console.error(err), { 
    enableHighAccuracy: true,
    maximumAge: 0 
});