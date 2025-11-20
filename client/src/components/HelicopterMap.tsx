import { useEffect, useRef, useState } from "react";
import type { Helicopter } from "@shared/schema";

declare global {
  interface Window {
    L: any;
  }
}

interface HelicopterMapProps {
  helicopters: Helicopter[];
}

interface HelicopterTrail {
  positions: [number, number][];
  timestamps: number[];
}

export function HelicopterMap({ helicopters }: HelicopterMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markersLayer = useRef<any>(null);
  const trailsLayer = useRef<any>(null);
  const helicopterMarkers = useRef<Map<string, any>>(new Map());
  const helicopterTrails = useRef<Map<string, HelicopterTrail>>(new Map());
  const [animating, setAnimating] = useState(false);

  // Maximum number of trail points to keep per helicopter
  const MAX_TRAIL_POINTS = 8;
  // Trail retention time (5 minutes)
  const TRAIL_MAX_AGE = 5 * 60 * 1000;

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

      // Create layer groups
      trailsLayer.current = window.L.layerGroup().addTo(mapInstance.current);
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

    // Update helicopter positions and trails
    const currentTime = Date.now();
    const currentHelicopterIds = new Set<string>();

    helicopters.forEach((helicopter) => {
      if (!helicopter.latitude || !helicopter.longitude) return;

      currentHelicopterIds.add(helicopter.id);
      const position: [number, number] = [helicopter.latitude, helicopter.longitude];

      // Update or create trail
      let trail = helicopterTrails.current.get(helicopter.id);
      if (!trail) {
        trail = { positions: [], timestamps: [] };
        helicopterTrails.current.set(helicopter.id, trail);
      }

      // Add new position to trail
      const lastPos = trail.positions[trail.positions.length - 1];
      const hasMovedSignificantly = !lastPos || 
        Math.abs(lastPos[0] - position[0]) > 0.0001 || 
        Math.abs(lastPos[1] - position[1]) > 0.0001;

      if (hasMovedSignificantly) {
        trail.positions.push(position);
        trail.timestamps.push(currentTime);

        // Keep only recent trail points
        while (trail.positions.length > MAX_TRAIL_POINTS || 
               (trail.timestamps.length > 0 && currentTime - trail.timestamps[0] > TRAIL_MAX_AGE)) {
          trail.positions.shift();
          trail.timestamps.shift();
        }
      }

      // Update or create marker
      let marker = helicopterMarkers.current.get(helicopter.id);
      
      if (!marker) {
        // Create helicopter icon
        const helicopterIcon = window.L.divIcon({
          className: 'helicopter-marker',
          html: `
            <div id="heli-${helicopter.id}" style="
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
              transition: transform 0.5s ease-out;
            ">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
              </svg>
            </div>
          `,
          iconSize: [40, 40],
          iconAnchor: [20, 20],
        });

        // Create marker
        marker = window.L.marker(position, { icon: helicopterIcon });
        
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
        marker.bindPopup(popupContent);
        marker.on('click', function() {
          marker.openPopup();
        });

        markersLayer.current.addLayer(marker);
        helicopterMarkers.current.set(helicopter.id, marker);
      } else {
        // Smoothly animate marker to new position using interpolation
        const currentLatLng = marker.getLatLng();
        const startLat = currentLatLng.lat;
        const startLng = currentLatLng.lng;
        const endLat = position[0];
        const endLng = position[1];
        
        // Only animate if position has changed significantly
        if (Math.abs(startLat - endLat) > 0.00001 || Math.abs(startLng - endLng) > 0.00001) {
          const duration = 1500; // 1.5 seconds animation
          const startTime = performance.now();
          
          // Easing function for smooth animation
          const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
          
          const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easedProgress = easeOutCubic(progress);
            
            // Interpolate latitude and longitude
            const newLat = startLat + (endLat - startLat) * easedProgress;
            const newLng = startLng + (endLng - startLng) * easedProgress;
            
            marker.setLatLng([newLat, newLng]);
            
            // Continue animation if not finished
            if (progress < 1) {
              requestAnimationFrame(animate);
            }
          };
          
          requestAnimationFrame(animate);
        }
        
        // Update heading rotation smoothly
        const element = document.getElementById(`heli-${helicopter.id}`);
        if (element && helicopter.heading !== undefined) {
          element.style.transform = `rotate(${helicopter.heading}deg)`;
        }
      }
    });

    // Remove markers for helicopters that are no longer present
    helicopterMarkers.current.forEach((marker, id) => {
      if (!currentHelicopterIds.has(id)) {
        markersLayer.current.removeLayer(marker);
        helicopterMarkers.current.delete(id);
        helicopterTrails.current.delete(id);
      }
    });

    // Draw trails
    if (trailsLayer.current) {
      trailsLayer.current.clearLayers();

      helicopterTrails.current.forEach((trail, helicopterId) => {
        if (trail.positions.length < 2) return;

        // Create gradient trail effect using multiple polylines
        const segments = trail.positions.length - 1;
        
        for (let i = 0; i < segments; i++) {
          const startPos = trail.positions[i];
          const endPos = trail.positions[i + 1];
          
          // Calculate opacity based on age (newer = more opaque)
          const age = currentTime - trail.timestamps[i];
          const ageRatio = 1 - (age / TRAIL_MAX_AGE);
          const segmentRatio = (i + 1) / trail.positions.length;
          
          // Combine both factors for beautiful fade effect
          const opacity = Math.min(0.8, Math.max(0.15, ageRatio * segmentRatio));
          
          // Calculate line width (thicker for newer segments)
          const weight = 3 + (segmentRatio * 2);

          // Create polyline segment
          const polyline = window.L.polyline([startPos, endPos], {
            color: '#ef4444',
            weight: weight,
            opacity: opacity,
            smoothFactor: 1,
            lineCap: 'round',
            lineJoin: 'round',
          });

          trailsLayer.current.addLayer(polyline);
        }

        // Add glow effect for most recent trail segment
        if (segments > 0) {
          const lastSegment = window.L.polyline(
            [trail.positions[segments - 1], trail.positions[segments]], 
            {
              color: '#fecaca',
              weight: 6,
              opacity: 0.3,
              smoothFactor: 1,
              lineCap: 'round',
              lineJoin: 'round',
            }
          );
          trailsLayer.current.addLayer(lastSegment);
        }
      });
    }
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
