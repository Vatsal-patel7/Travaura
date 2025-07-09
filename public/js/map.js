// public/js/map.js
document.addEventListener('DOMContentLoaded', function () {
  const mapElement = document.getElementById('map');
  
  if (!mapElement) {
    console.error('Map element not found');
    return;
  }

  const lat = parseFloat(mapElement.dataset.lat);
  const lng = parseFloat(mapElement.dataset.lng);
  const title = mapElement.dataset.title;

  // Check if coordinates are valid
  if (isNaN(lat) || isNaN(lng)) {
    console.error('Invalid coordinates:', lat, lng);
    mapElement.innerHTML = '<div class="alert alert-warning">Map coordinates not available</div>';
    return;
  }

  // Set map height if not set in CSS
  mapElement.style.height = mapElement.style.height || '400px';
  mapElement.style.width = mapElement.style.width || '100%';

  try {
    // Initialize map
    const map = L.map('map').setView([lat, lng], 13);

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    }).addTo(map);

    // Create custom house icon with Font Awesome
    const houseIcon = L.divIcon({
      html: `
        <div class="custom-marker-container">
          <i class="fas fa-home"></i>
        </div>
      `,
      className: 'custom-house-marker',
      iconSize: [40, 40],
      iconAnchor: [20, 20],
      popupAnchor: [0, -25]
    });

    // Add circle around the marker
    const circle = L.circle([lat, lng], {
      color: '#007bff',
      fillColor: '#007bff',
      fillOpacity: 0.1,
      radius: 500, // 500 meters radius
      weight: 2,
      dashArray: '5, 5' // Optional: dashed circle
    }).addTo(map);

    // Add marker with custom house icon
    const marker = L.marker([lat, lng], { icon: houseIcon }).addTo(map);
    
    if (title) {
      marker.bindPopup(`
        <div style="text-align: center; padding: 5px;">
          <b>${title}</b><br>
          <small><i class="fas fa-map-marker-alt"></i> Property Location</small>
        </div>
      `).openPopup();
      
      // Also bind popup to circle
      circle.bindPopup(`
        <div style="text-align: center; padding: 5px;">
          <b>${title}</b><br>
          <small><i class="fas fa-circle"></i> Approximate area (500m radius)</small>
        </div>
      `);
    }

    // Handle map resize
    setTimeout(() => {
      map.invalidateSize();
    }, 100);

  } catch (error) {
    console.error('Error initializing map:', error);
    mapElement.innerHTML = '<div class="alert alert-danger">Error loading map</div>';
  }
});