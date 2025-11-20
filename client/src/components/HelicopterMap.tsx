import { useEffect, useRef } from "react";
import type { Helicopter } from "@shared/schema";

declare global {
  interface Window {
    L: any;
  }
}

interface HelicopterMapProps {
  helicopters: Helicopter[];
}

export function HelicopterMap({ helicopters }: HelicopterMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markersLayer = useRef<any>(null);

  useEffect(() => {
    if (!mapRef.current || !window.L) return;

    // Indianapolis coordinates
    const indianapolisCenter: [number, number] = [39.7684, -86.1581];

    // Initialize map only once
    if (!mapInstance.current) {
      mapInstance.current = window.L.map(mapRef.current, {
        center: indianapolisCenter,
        zoom: 11,
        zoomControl: true,
        attributionControl: false,
      });

      // Use dark tile layer for dark theme
      window.L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd',
      }).addTo(mapInstance.current);

      // Create markers layer group
      markersLayer.current = window.L.layerGroup().addTo(mapInstance.current);

      // Add city label for Indianapolis
      window.L.marker(indianapolisCenter, {
        icon: window.L.divIcon({
          className: 'city-label',
          html: '<div style="color: #fff; font-size: 24px; font-weight: bold; text-shadow: 2px 2px 4px rgba(0,0,0,0.8);">Indianapolis</div>',
          iconSize: [150, 40],
          iconAnchor: [75, 20],
        }),
      }).addTo(mapInstance.current);
    }

    // Clear existing helicopter markers
    if (markersLayer.current) {
      markersLayer.current.clearLayers();
    }

    // Add helicopter markers
    helicopters.forEach((helicopter) => {
      if (!helicopter.latitude || !helicopter.longitude) return;

      // Create helicopter icon (using red for emergency helicopters)
      const helicopterIcon = window.L.divIcon({
        className: 'helicopter-marker',
        html: `
          <div style="
            width: 40px; 
            height: 40px; 
            background-color: #ef4444; 
            border: 3px solid #fff; 
            border-radius: 50%; 
            display: flex; 
            align-items: center; 
            justify-content: center;
            box-shadow: 0 4px 8px rgba(0,0,0,0.5);
            transform: rotate(${helicopter.heading || 0}deg);
          ">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
            </svg>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });

      // Create popup content
      const popupContent = `
        <div style="min-width: 200px; color: #fff; background: #1f2937; padding: 12px; border-radius: 8px;">
          <div style="font-size: 18px; font-weight: bold; margin-bottom: 8px; color: #ef4444;">
            ${helicopter.callsign || 'Unknown Callsign'}
          </div>
          ${helicopter.aircraftType ? `
            <div style="font-size: 14px; margin-bottom: 4px;">
              <strong>Aircraft:</strong> ${helicopter.aircraftType}
            </div>
          ` : ''}
          ${helicopter.registration ? `
            <div style="font-size: 14px; margin-bottom: 4px;">
              <strong>Registration:</strong> ${helicopter.registration}
            </div>
          ` : ''}
          ${helicopter.altitude ? `
            <div style="font-size: 14px; margin-bottom: 4px;">
              <strong>Altitude:</strong> ${helicopter.altitude} ft
            </div>
          ` : ''}
          ${helicopter.speed ? `
            <div style="font-size: 14px; margin-bottom: 4px;">
              <strong>Speed:</strong> ${helicopter.speed} kts
            </div>
          ` : ''}
          ${helicopter.heading !== undefined ? `
            <div style="font-size: 14px; margin-bottom: 4px;">
              <strong>Heading:</strong> ${helicopter.heading}°
            </div>
          ` : ''}
        </div>
      `;

      const marker = window.L.marker([helicopter.latitude, helicopter.longitude], {
        icon: helicopterIcon,
      }).bindPopup(popupContent);

      markersLayer.current.addLayer(marker);
    });
  }, [helicopters]);

  return (
    <div 
      ref={mapRef} 
      className="w-full h-full rounded-lg overflow-hidden border-2 border-border"
      data-testid="map-helicopters"
      style={{ minHeight: '500px' }}
    />
  );
}
