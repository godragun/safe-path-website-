"use client";

import React, { useEffect, useRef, useState } from "react";
import { Map, NavigationControl, Marker } from "maplibre-gl";

import { RouteOption } from "./ResilienceRouting";

export interface HazardPin {
  id: string;
  lat: number;
  lng: number;
  severity: "info" | "warning" | "critical";
  description: string;
  imageUrl?: string;
  confidence?: "LOW" | "MEDIUM" | "HIGH";
  reportCount?: number;
}

interface MapViewProps {
  hazards: HazardPin[];
  safeZones?: { id: string; lat: number; lng: number; name: string }[];
  routes?: RouteOption[];
  onPinClick: (hazard: HazardPin) => void;
}

// Dark raster tile style — guaranteed to work without CORS issues
const DARK_STYLE = {
  version: 8 as const,
  sources: {
    "dark-tiles": {
      type: "raster" as const,
      tiles: [
        "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
      ],
      tileSize: 256,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxzoom: 19,
    },
  },
  layers: [
    {
      id: "dark-tiles-layer",
      type: "raster" as const,
      source: "dark-tiles",
      minzoom: 0,
      maxzoom: 19,
      paint: {
        "raster-brightness-max": 0.35,
        "raster-saturation": -0.8,
        "raster-contrast": 0.3,
      },
    },
  ],
};

export default function MapView({ hazards, safeZones = [], routes = [], onPinClick }: MapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<Map | null>(null);
  const markersRef = useRef<Marker[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Initialize map once
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Inject MapLibre CSS
    if (!document.getElementById("maplibre-gl-css")) {
      const link = document.createElement("link");
      link.id = "maplibre-gl-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/maplibre-gl@5.5.0/dist/maplibre-gl.css";
      document.head.appendChild(link);
    }

    const map = new Map({
      container: mapContainerRef.current,
      style: DARK_STYLE,
      center: [79.8612, 6.9271],
      zoom: 12.5,
      minZoom: 6,
      maxBounds: [
        [79.3, 5.7], // Southwest coordinates of Sri Lanka
        [82.0, 9.9], // Northeast coordinates of Sri Lanka
      ],
      renderWorldCopies: false,
      pitch: 0,
      bearing: 0,
    });

    map.addControl(
      new NavigationControl({ showCompass: true, showZoom: true }),
      "top-right"
    );

    map.on("load", () => setIsLoaded(true));

    // Safety fallback
    const timer = setTimeout(() => setIsLoaded(true), 4000);

    mapInstanceRef.current = map;

    return () => {
      clearTimeout(timer);
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Sync hazard markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !isLoaded) return;

    // Remove old markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    // Render Safe Zones (Green Places)
    safeZones.forEach((zone) => {
      const color = "#10b981"; // Emerald green
      const size = 16;
      const wrapper = document.createElement("div");
      wrapper.style.cssText = `position:relative;cursor:pointer;z-index:4;`;
      
      const dot = document.createElement("div");
      dot.style.cssText = `
        width:${size}px;height:${size}px;border-radius:50%;
        background:${color};
        box-shadow:0 0 12px ${color}88,0 0 24px ${color}44;
        border:2px solid #ffffff;
        transition:transform .2s;cursor:pointer;
      `;
      
      const label = document.createElement("div");
      label.innerText = zone.name;
      label.style.cssText = `
        position:absolute;top:-25px;left:50%;transform:translateX(-50%);
        background:white;color:#0f172a;font-size:10px;font-weight:bold;
        padding:2px 6px;border-radius:4px;white-space:nowrap;
        box-shadow:0 2px 4px rgba(0,0,0,0.2);opacity:0;transition:opacity 0.2s;
      `;
      wrapper.appendChild(label);
      
      dot.onmouseover = () => { dot.style.transform = "scale(1.5)"; label.style.opacity = "1"; };
      dot.onmouseout = () => { dot.style.transform = "scale(1)"; label.style.opacity = "0"; };
      wrapper.appendChild(dot);
      
      const marker = new Marker({ element: wrapper })
        .setLngLat([zone.lng, zone.lat])
        .addTo(map);
      markersRef.current.push(marker);
    });

    hazards.forEach((h) => {
      const color =
        h.severity === "critical"
          ? "#ef4444"
          : h.severity === "warning"
          ? "#f59e0b"
          : "#06b6d4";

      const size = h.severity === "critical" ? 20 : 14;

      // Build marker DOM
      const wrapper = document.createElement("div");
      wrapper.style.cssText = `position:relative;cursor:pointer;z-index:${
        h.severity === "critical" ? 10 : 5
      }`;

      // Dot
      const dot = document.createElement("div");
      dot.style.cssText = `
        width:${size}px;height:${size}px;border-radius:50%;
        background:${color};
        box-shadow:0 0 12px ${color}88,0 0 24px ${color}44;
        border:2px solid ${color}cc;
        transition:transform .2s;cursor:pointer;
      `;
      dot.onmouseover = () => (dot.style.transform = "scale(1.5)");
      dot.onmouseout = () => (dot.style.transform = "scale(1)");
      wrapper.appendChild(dot);

      // Ping ring
      const ring = document.createElement("div");
      ring.style.cssText = `
        width:${size + 10}px;height:${size + 10}px;border-radius:50%;
        border:2px solid ${color}55;position:absolute;
        top:-5px;left:-5px;pointer-events:none;
        animation:hazardPing 1.5s cubic-bezier(0,0,0.2,1) infinite;
      `;
      wrapper.appendChild(ring);

      wrapper.addEventListener("click", (e) => {
        e.stopPropagation();
        onPinClick(h);
      });

      const marker = new Marker({ element: wrapper })
        .setLngLat([h.lng, h.lat])
        .addTo(map);

      markersRef.current.push(marker);
    });

    // Draw Routes
    const drawRoutes = () => {
      routes.forEach((route) => {
        const sourceId = `route-${route.id}`;
        const layerId = `route-layer-${route.id}`;
        
        if (map.getSource(sourceId)) {
          map.removeLayer(layerId);
          map.removeSource(sourceId);
        }

        // Extremely simplified mock route data for the demo
        const isPrimary = route.type === "FASTEST_ROUTE";
        const isAlternative = route.type === "SAFEST_ROUTE";
        const offset = isPrimary ? 0 : isAlternative ? 0.005 : -0.005;
        
        let color = "#3b82f6"; // Blue default
        if (route.status === "AVAILABLE" && isPrimary) color = "#10b981"; // Green primary
        else if (route.status === "BLOCKED") color = "#ef4444"; // Red blocked
        else if (route.status === "CONTINGENCY") color = "#f59e0b"; // Orange contingency
        else if (route.status === "AVAILABLE" && isAlternative) color = "#6366f1"; // Indigo safe route
        
        map.addSource(sourceId, {
          type: "geojson",
          data: {
            type: "Feature",
            properties: {},
            geometry: {
              type: "LineString",
              coordinates: [
                [79.865 + offset, 6.927],
                [79.870 + offset, 6.920],
                [79.880 + offset, 6.910],
              ],
            },
          },
        });

        map.addLayer({
          id: layerId,
          type: "line",
          source: sourceId,
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
          paint: {
            "line-color": color,
            "line-width": 6,
            "line-opacity": route.status === "BLOCKED" ? 0.3 : 0.8,
            "line-dasharray": route.status === "CONTINGENCY" ? [2, 2] : [1]
          },
        });
      });
    };

    // If map is loaded, wait a tick to ensure style is ready
    setTimeout(drawRoutes, 100);

  }, [hazards, safeZones, routes, isLoaded, onPinClick]);

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Loading overlay */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#0a0e1a] z-10">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
            <span className="font-mono text-sm text-slate-400">
              Initializing Mapping Engine…
            </span>
          </div>
        </div>
      )}

      {/* Map container */}
      <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" />

      {/* Bottom gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#0a0e1a]/80 to-transparent pointer-events-none z-[1]" />

      {/* Keyframes for ping animation */}
      <style>{`
        @keyframes hazardPing {
          75%, 100% { transform: scale(2.2); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
