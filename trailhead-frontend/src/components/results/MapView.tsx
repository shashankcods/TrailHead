import React, { useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { PlannerData, PlannerActivity } from "@/types/planner";
import type { NormalizedDay } from "@/components/results/itineraryUtils";

// Day palette — cycles if more than 8 days
const DAY_COLORS = [
  "#2563eb", "#16a34a", "#dc2626", "#d97706",
  "#7c3aed", "#0891b2", "#db2777", "#65a30d",
];

interface MapViewProps {
  plannerData: PlannerData;
  normalizedDays: NormalizedDay[];
}

interface PlottedActivity {
  id: string;
  title: string;
  dayNumber: number;
  dayTitle: string;
  timeLabel?: string;
  lat: number;
  lng: number;
  color: string;
}

const extractCoords = (a: PlannerActivity): { lat: number; lng: number } | null => {
  const num = (v: unknown) => {
    if (typeof v === "number" && Number.isFinite(v)) return v;
    if (typeof v === "string") { const n = Number(v); if (Number.isFinite(n)) return n; }
    return null;
  };

  const lat =
    num(a.lat) ??
    num(a.latitude) ??
    num((a.coordinates as Record<string, unknown> | undefined)?.lat) ??
    num((a.coordinates as Record<string, unknown> | undefined)?.latitude) ??
    num((a.location as Record<string, unknown> | undefined)?.lat) ??
    num((a.location as Record<string, unknown> | undefined)?.latitude) ??
    num((a.gps_coordinates as Record<string, unknown> | undefined)?.latitude);

  const lng =
    num(a.lon) ??
    num(a.lng) ??
    num(a.longitude) ??
    num((a.coordinates as Record<string, unknown> | undefined)?.lon) ??
    num((a.coordinates as Record<string, unknown> | undefined)?.lng) ??
    num((a.coordinates as Record<string, unknown> | undefined)?.longitude) ??
    num((a.location as Record<string, unknown> | undefined)?.lon) ??
    num((a.location as Record<string, unknown> | undefined)?.lng) ??
    num((a.location as Record<string, unknown> | undefined)?.longitude) ??
    num((a.gps_coordinates as Record<string, unknown> | undefined)?.longitude);

  if (lat == null || lng == null) return null;
  if (lat === 0 && lng === 0) return null;
  return { lat, lng };
};

const makeDivIcon = (color: string, label: string) =>
  L.divIcon({
    html: `
      <div style="
        width:28px; height:28px; border-radius:50%;
        background:${color}; border:3px solid white;
        box-shadow:0 2px 6px rgba(0,0,0,0.35);
        display:flex; align-items:center; justify-content:center;
        color:white; font-size:11px; font-weight:800; font-family:sans-serif;
      ">${label}</div>`,
    className: "",
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -16],
  });

// Fit map to all markers after render
const FitBounds: React.FC<{ points: [number, number][] }> = ({ points }) => {
  const map = useMap();
  React.useEffect(() => {
    if (points.length === 0) return;
    if (points.length === 1) {
      map.setView(points[0], 14);
    } else {
      map.fitBounds(L.latLngBounds(points), { padding: [40, 40] });
    }
  }, [map, points]);
  return null;
};

const MapView: React.FC<MapViewProps> = ({ plannerData, normalizedDays }) => {
  // Build lookup: activity id → raw activity (for coordinates)
  const activityPool = useMemo(() => {
    const pool = new Map<string, PlannerActivity>();
    (plannerData.activities ?? []).forEach((a) => {
      if (a.id) pool.set(a.id, a);
      if (a.activityId) pool.set(a.activityId, a);
    });
    return pool;
  }, [plannerData.activities]);

  const plotted = useMemo<PlottedActivity[]>(() => {
    const result: PlottedActivity[] = [];
    normalizedDays.forEach((day, dayIdx) => {
      const color = DAY_COLORS[dayIdx % DAY_COLORS.length];
      day.activities.forEach((act) => {
        const raw = activityPool.get(act.id);
        if (!raw) return;
        const coords = extractCoords(raw);
        if (!coords) return;
        result.push({
          id: act.id,
          title: act.title,
          dayNumber: day.dayNumber,
          dayTitle: day.title,
          timeLabel: act.timeLabel,
          ...coords,
          color,
        });
      });
    });
    return result;
  }, [normalizedDays, activityPool]);

  const points = useMemo<[number, number][]>(
    () => plotted.map((p) => [p.lat, p.lng]),
    [plotted]
  );

  const defaultCenter: [number, number] = points.length > 0 ? points[0] : [20, 0];

  if (plotted.length === 0) {
    return (
      <div className="rounded-2xl border border-black/10 dark:border-white/15 bg-white/80 dark:bg-black/35 p-8 text-center">
        <p className="text-2xl mb-2">🗺️</p>
        <p className="font-bold">No mappable activities</p>
        <p className="text-sm text-black/55 dark:text-white/55 mt-1">
          Activity coordinates weren't available for this trip.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-black/10 dark:border-white/15 overflow-hidden shadow-sm" style={{ height: "500px" }}>
        <MapContainer
          center={defaultCenter}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <FitBounds points={points} />
          {plotted.map((p) => (
            <Marker
              key={p.id}
              position={[p.lat, p.lng]}
              icon={makeDivIcon(p.color, String(p.dayNumber))}
            >
              <Popup>
                <div style={{ minWidth: "160px" }}>
                  <p style={{ fontWeight: 800, fontSize: "13px", marginBottom: "4px" }}>{p.title}</p>
                  <p style={{ fontSize: "11px", color: "#666", marginBottom: "2px" }}>
                    Day {p.dayNumber} · {p.dayTitle}
                  </p>
                  {p.timeLabel && (
                    <p style={{ fontSize: "11px", color: "#888" }}>{p.timeLabel}</p>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Day legend */}
      <div className="rounded-2xl border border-black/10 dark:border-white/15 bg-white/80 dark:bg-black/35 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-black/55 dark:text-white/55 mb-3">
          Days
        </p>
        <div className="flex flex-wrap gap-2">
          {normalizedDays.map((day, idx) => (
            <span
              key={day.id}
              className="flex items-center gap-2 rounded-full border border-black/10 dark:border-white/15 px-3 py-1.5 text-xs font-semibold"
            >
              <span
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: DAY_COLORS[idx % DAY_COLORS.length] }}
              />
              Day {day.dayNumber} · {day.title}
            </span>
          ))}
        </div>
      </div>

      <p className="text-xs text-black/40 dark:text-white/40 text-center">
        {plotted.length} of {normalizedDays.flatMap((d) => d.activities).length} activities mapped · click a pin for details
      </p>
    </div>
  );
};

export default MapView;
