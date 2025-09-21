import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in Leaflet with bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const PropertyMap = ({ 
  properties = [], 
  center = [28.6139, 77.2090], // Default to Delhi
  zoom = 12,
  height = '400px',
  onPropertyClick = null,
  showSearch = false,
  clustered = true
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    // Initialize map
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapRef.current, {
        center: center,
        zoom: zoom,
        zoomControl: true,
        scrollWheelZoom: true,
        dragging: true,
        touchZoom: true
      });

      // Add tile layer (you can switch between different providers)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(mapInstanceRef.current);
    }

    return () => {
      // Cleanup on unmount
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => {
      mapInstanceRef.current.removeLayer(marker);
    });
    markersRef.current = [];

    // Add property markers
    if (properties && properties.length > 0) {
      properties.forEach(property => {
        if (property.latitude && property.longitude) {
          // Create custom icon based on property price/type
          const priceRange = getPriceRange(property.price);
          const customIcon = createPropertyIcon(priceRange, property.type);

          const marker = L.marker([property.latitude, property.longitude], {
            icon: customIcon
          }).addTo(mapInstanceRef.current);

          // Create popup content
          const popupContent = createPopupContent(property);
          marker.bindPopup(popupContent);

          // Handle click events
          if (onPropertyClick) {
            marker.on('click', () => onPropertyClick(property));
          }

          markersRef.current.push(marker);
        }
      });

      // Fit map to show all properties
      if (markersRef.current.length > 0) {
        const group = new L.featureGroup(markersRef.current);
        mapInstanceRef.current.fitBounds(group.getBounds().pad(0.1));
      }
    }
  }, [properties, onPropertyClick]);

  // Helper function to determine price range for icon styling
  const getPriceRange = (price) => {
    if (!price) return 'unknown';
    const numPrice = parseFloat(price);
    if (numPrice < 2) return 'budget';
    if (numPrice < 5) return 'mid';
    if (numPrice < 10) return 'premium';
    return 'luxury';
  };

  // Create custom property icons
  const createPropertyIcon = (priceRange, propertyType) => {
    const colors = {
      budget: '#4CAF50',    // Green
      mid: '#FF9800',       // Orange  
      premium: '#2196F3',   // Blue
      luxury: '#9C27B0',    // Purple
      unknown: '#757575'    // Grey
    };

    const typeIcons = {
      apartment: '🏢',
      house: '🏠',
      villa: '🏘️',
      commercial: '🏢',
      land: '🏞️'
    };

    return L.divIcon({
      className: 'custom-property-icon',
      html: `
        <div style="
          background: ${colors[priceRange]};
          width: 30px;
          height: 30px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          font-size: 14px;
        ">
          ${typeIcons[propertyType] || '🏠'}
        </div>
      `,
      iconSize: [30, 30],
      iconAnchor: [15, 15]
    });
  };

  // Create popup content for properties
  const createPopupContent = (property) => {
    return `
      <div style="min-width: 200px;">
        <div style="margin-bottom: 8px;">
          <img src="${property.image}" alt="${property.name}" 
               style="width: 100%; height: 120px; object-fit: cover; border-radius: 4px;" />
        </div>
        <h4 style="margin: 0 0 8px 0; color: #333;">${property.name}</h4>
        <p style="margin: 0 0 8px 0; color: #666; font-size: 0.9em;">${property.address}</p>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-weight: bold; color: #4CAF50; font-size: 1.1em;">
            ${property.price} ETH
          </span>
          <button onclick="window.viewProperty && window.viewProperty(${property.id})" 
                  style="
                    background: #2196F3;
                    color: white;
                    border: none;
                    padding: 4px 8px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 0.8em;
                  ">
            View Details
          </button>
        </div>
      </div>
    `;
  };

  return (
    <div className="property-map-container">
      {showSearch && (
        <div className="map-search-overlay">
          <input
            type="text"
            placeholder="Search properties on map..."
            className="map-search-input"
          />
        </div>
      )}
      
      <div 
        ref={mapRef} 
        style={{ 
          height: height, 
          width: '100%',
          borderRadius: '8px',
          overflow: 'hidden'
        }} 
      />
      
      <div className="map-legend">
        <div className="legend-item">
          <span className="legend-color budget"></span>
          <span>Budget (&lt; 2 ETH)</span>
        </div>
        <div className="legend-item">
          <span className="legend-color mid"></span>
          <span>Mid-range (2-5 ETH)</span>
        </div>
        <div className="legend-item">
          <span className="legend-color premium"></span>
          <span>Premium (5-10 ETH)</span>
        </div>
        <div className="legend-item">
          <span className="legend-color luxury"></span>
          <span>Luxury (10+ ETH)</span>
        </div>
      </div>
    </div>
  );
};

export default PropertyMap;