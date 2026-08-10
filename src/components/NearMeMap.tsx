"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export type MapMarker = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  distanceKm: number;
  verificationStatus: string;
  category?: string | null;
};

const STATUS_COLOR: Record<string, string> = {
  government_verified: "#059669", // emerald-600
  registration_verified: "#0284c7", // sky-600
  phone_verified: "#4f46e5", // indigo-600
  user_submitted: "#d97706", // amber-600
  needs_verification: "#e11d48", // rose-600
};

function dotIcon(color: string, active: boolean) {
  const size = active ? 22 : 16;
  return L.divIcon({
    className: "",
    html: `<span style="display:block;width:${size}px;height:${size}px;border-radius:9999px;background:${color};border:2px solid white;box-shadow:0 0 0 1.5px rgba(0,0,0,.35)"></span>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

const centerIcon = L.divIcon({
  className: "",
  html: `<span style="display:block;width:18px;height:18px;border-radius:9999px;background:#2563eb;border:3px solid white;box-shadow:0 0 0 2px rgba(37,99,235,.4)"></span>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

export default function NearMeMap({
  center,
  radiusKm,
  markers,
  selectedId,
  onMapClick,
  onSelect,
}: {
  center: { lat: number; lng: number };
  radiusKm: number;
  markers: MapMarker[];
  selectedId?: string | null;
  onMapClick?: (lat: number, lng: number) => void;
  onSelect?: (id: string) => void;
}) {
  const elRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);
  const circleRef = useRef<L.Circle | null>(null);
  const centerRef = useRef<L.Marker | null>(null);
  const markerById = useRef<Map<string, L.Marker>>(new Map());
  // keep latest callbacks without re-registering handlers
  const clickCb = useRef(onMapClick);
  const selectCb = useRef(onSelect);
  useEffect(() => {
    clickCb.current = onMapClick;
    selectCb.current = onSelect;
  });

  // init once
  useEffect(() => {
    if (mapRef.current || !elRef.current) return;
    const map = L.map(elRef.current, { scrollWheelZoom: true }).setView(
      [center.lat, center.lng],
      11,
    );
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
      maxZoom: 19,
    }).addTo(map);
    layerRef.current = L.layerGroup().addTo(map);
    map.on("click", (e: L.LeafletMouseEvent) =>
      clickCb.current?.(e.latlng.lat, e.latlng.lng),
    );
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // center + radius circle
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    map.setView([center.lat, center.lng]);
    if (!centerRef.current) {
      centerRef.current = L.marker([center.lat, center.lng], { icon: centerIcon }).addTo(map);
    } else {
      centerRef.current.setLatLng([center.lat, center.lng]);
    }
    if (!circleRef.current) {
      circleRef.current = L.circle([center.lat, center.lng], {
        radius: radiusKm * 1000,
        color: "#2563eb",
        weight: 1,
        fillColor: "#3b82f6",
        fillOpacity: 0.08,
      }).addTo(map);
    } else {
      circleRef.current.setLatLng([center.lat, center.lng]);
      circleRef.current.setRadius(radiusKm * 1000);
    }
  }, [center.lat, center.lng, radiusKm]);

  // markers
  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;
    layer.clearLayers();
    markerById.current.clear();
    for (const m of markers) {
      if (!Number.isFinite(m.lat) || !Number.isFinite(m.lng)) continue;
      const color = STATUS_COLOR[m.verificationStatus] ?? STATUS_COLOR.needs_verification;
      const marker = L.marker([m.lat, m.lng], {
        icon: dotIcon(color, m.id === selectedId),
      });
      marker.bindPopup(
        `<strong>${escapeHtml(m.name)}</strong><br/>` +
          `${escapeHtml(m.category ?? "")}${m.category ? " · " : ""}${m.distanceKm.toFixed(1)} km away<br/>` +
          `<a href="/care-centers/${m.id}">View details →</a>`,
      );
      marker.on("click", () => selectCb.current?.(m.id));
      marker.addTo(layer);
      markerById.current.set(m.id, marker);
    }
  }, [markers, selectedId]);

  // open popup for the selected marker
  useEffect(() => {
    if (!selectedId) return;
    const marker = markerById.current.get(selectedId);
    if (marker && mapRef.current) {
      mapRef.current.panTo(marker.getLatLng());
      marker.openPopup();
    }
  }, [selectedId]);

  return <div ref={elRef} className="h-full w-full" />;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
