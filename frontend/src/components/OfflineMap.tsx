"use client";

import React, { useEffect, useRef, useState } from "react";
import { Map, NavigationControl, Marker } from "maplibre-gl";

export interface HazardPin {
  id: string;
  lat: number;
  lng: number;
  severity: "critical" | "warning" | "info";
  description: string;
}

interface MapViewProps {
  hazards: HazardPin[];
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

export default function MapView({ hazards, onPinClick }: MapViewProps) {
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
      center: [-74.006, 40.7128],
      zoom: 13,
      pitch: 0,
      bearing: 0,
      antialias: true,
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
  }, [hazards, isLoaded, onPinClick]);

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Loading overlay */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#0a0e1a] z-10">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
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
