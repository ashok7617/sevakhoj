"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { GROUPS } from "@/lib/groups";
import { VerificationBadge } from "@/components/VerificationBadge";
import type { VerificationStatus } from "@/lib/badges";
import type { MapMarker } from "@/components/NearMeMap";

const NearMeMap = dynamic(() => import("@/components/NearMeMap"), {
  ssr: false,
  loading: () => (
    <div className="grid h-full place-items-center text-sm text-slate-400">Loading map…</div>
  ),
});

type Facility = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  category: string | null;
  groupSlug: string | null;
  verificationStatus: string;
  city: string | null;
  district: string | null;
  state: string | null;
  distanceKm: number;
};

// Default to Lucknow (Phase-1 pilot city).
const DEFAULT_CENTER = { lat: 26.8467, lng: 80.9462 };

export default function NearMePage() {
  const [center, setCenter] = useState(DEFAULT_CENTER);
  const [radiusKm, setRadiusKm] = useState(15);
  const [group, setGroup] = useState("");
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(false);
  const [meta, setMeta] = useState<{ dbAvailable: boolean; fallback: boolean }>({
    dbAvailable: true,
    fallback: false,
  });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [place, setPlace] = useState("");
  const [notice, setNotice] = useState<string | null>(null);

  // fetch nearby facilities (debounced for the radius slider)
  useEffect(() => {
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          lat: String(center.lat),
          lng: String(center.lng),
          radius: String(radiusKm),
        });
        if (group) params.set("group", group);
        const res = await fetch(`/api/facilities/near?${params.toString()}`);
        const json = await res.json();
        setFacilities(json.facilities ?? []);
        setMeta({ dbAvailable: !!json.dbAvailable, fallback: !!json.fallback });
      } catch {
        setFacilities([]);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(t);
  }, [center.lat, center.lng, radiusKm, group]);

  const useMyLocation = useCallback(() => {
    setNotice(null);
    if (!navigator.geolocation) {
      setNotice("Geolocation isn't available in this browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setCenter({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setNotice("Couldn't get your location — search a place or click the map instead."),
      { timeout: 8000 },
    );
  }, []);

  const searchPlace = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setNotice(null);
      if (!place.trim()) return;
      try {
        const res = await fetch(`/api/geocode?q=${encodeURIComponent(place.trim())}`);
        const json = await res.json();
        const first = json.results?.[0];
        if (first) setCenter({ lat: first.lat, lng: first.lng });
        else setNotice(`No match for “${place}”. Try a city or PIN, or click the map.`);
      } catch {
        setNotice("Place search is unavailable right now — click the map to set a point.");
      }
    },
    [place],
  );

  const mapMarkers: MapMarker[] = useMemo(
    () =>
      facilities.map((f) => ({
        id: f.id,
        name: f.name,
        lat: f.latitude,
        lng: f.longitude,
        distanceKm: f.distanceKm,
        verificationStatus: f.verificationStatus,
        category: f.category,
      })),
    [facilities],
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <h1 className="text-2xl font-bold text-slate-900">Find care near you</h1>
      <p className="mt-1 text-sm text-slate-600">
        Search by location and distance. Results are ordered by how close they are.
      </p>

      {/* Controls */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          onClick={useMyLocation}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
        >
          📍 Use my location
        </button>
        <form onSubmit={searchPlace} className="flex flex-1 gap-2 min-w-56">
          <input
            value={place}
            onChange={(e) => setPlace(e.target.value)}
            placeholder="Search a city, area, or PIN code…"
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
          />
          <button
            type="submit"
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
          >
            Search
          </button>
        </form>
        <select
          value={group}
          onChange={(e) => setGroup(e.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500"
        >
          <option value="">All groups</option>
          {GROUPS.map((g) => (
            <option key={g.slug} value={g.slug}>
              {g.name}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <span className="whitespace-nowrap">Within {radiusKm} km</span>
          <input
            type="range"
            min={1}
            max={50}
            value={radiusKm}
            onChange={(e) => setRadiusKm(Number(e.target.value))}
            className="accent-emerald-600"
          />
        </label>
      </div>

      {notice && (
        <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800 ring-1 ring-amber-600/20">
          {notice}
        </p>
      )}
      {meta.fallback && (
        <p className="mt-3 rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-600">
          Showing bundled <strong>sample</strong> facilities — the database isn&apos;t connected.
          Run <code className="rounded bg-slate-200 px-1">npm run db:setup</code> for live results.
        </p>
      )}

      {/* Map + list */}
      <div className="mt-4 grid gap-4 lg:grid-cols-[380px_1fr]">
        <div className="order-2 lg:order-1">
          <div className="mb-2 text-sm text-slate-500">
            {loading ? "Searching…" : `${facilities.length} within ${radiusKm} km`}
          </div>
          <div className="max-h-[62vh] space-y-2 overflow-y-auto pr-1">
            {facilities.length === 0 && !loading ? (
              <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
                Nothing within {radiusKm} km. Widen the radius or move the point.
              </p>
            ) : (
              facilities.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setSelectedId(f.id)}
                  className={`block w-full rounded-xl border bg-white p-3 text-left transition hover:border-emerald-300 ${
                    selectedId === f.id ? "border-emerald-400 ring-2 ring-emerald-100" : "border-slate-200"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-medium text-slate-900">{f.name}</div>
                      <div className="text-xs text-slate-500">
                        {f.category ?? "Facility"}
                        {f.city ? ` · ${f.city}` : ""}
                        {f.district ? `, ${f.district}` : ""}
                      </div>
                    </div>
                    <span className="whitespace-nowrap rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                      {f.distanceKm.toFixed(1)} km
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <VerificationBadge status={f.verificationStatus as VerificationStatus} />
                    <Link
                      href={`/care-centers/${f.id}`}
                      className="text-xs font-medium text-emerald-700 hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Details →
                    </Link>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="order-1 h-[50vh] overflow-hidden rounded-xl border border-slate-200 lg:order-2 lg:h-[68vh]">
          <NearMeMap
            center={center}
            radiusKm={radiusKm}
            markers={mapMarkers}
            selectedId={selectedId}
            onMapClick={(lat, lng) => setCenter({ lat, lng })}
            onSelect={(id) => setSelectedId(id)}
          />
        </div>
      </div>

      <p className="mt-3 text-xs text-slate-400">
        Tip: click anywhere on the map to search around that point. Map data © OpenStreetMap
        contributors.
      </p>
    </div>
  );
}
