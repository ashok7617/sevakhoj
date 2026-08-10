import "server-only";
import { findFacilitiesNear, listFacilities, listSchemes } from "@/lib/queries";
import { SAMPLE_FACILITIES } from "@/data/sampleFacilities";
import { SAMPLE_SCHEMES } from "@/data/sampleSchemes";
import { haversineKm, isValidIndiaLatLng } from "@/lib/geo";
import type { CareCriteria } from "./criteria";

/** Unified result shapes so the UI doesn't care whether data came from PostGIS
 *  (with distance) or the plain filter query or the offline sample fallback. */
export type FinderFacility = {
  id: string;
  name: string;
  category: string | null;
  city: string | null;
  district: string | null;
  state: string | null;
  verificationStatus: string;
  residential: boolean | null;
  costType: string | null;
  distanceKm: number | null;
};

export type FinderScheme = {
  id: string;
  schemeName: string;
  governmentLevel: string;
  state: string | null;
  ministry: string | null;
  beneficiaryCategory: string | null;
  eligibility: string | null;
  benefits: string | null;
  applicationUrl: string | null;
  officialSourceUrl: string | null;
  verificationStatus: string;
};

export type SearchResult = {
  facilities: FinderFacility[];
  schemes: FinderScheme[];
  geo?: { lat: number; lng: number };
  dbAvailable: boolean;
};

const RADIUS_KM = 30;
const LIMIT = 12;

/** Resolve coordinates: gazetteer (already on criteria) → Nominatim → none. */
async function resolveGeo(c: CareCriteria): Promise<{ lat: number; lng: number } | undefined> {
  if (c.lat != null && c.lng != null && isValidIndiaLatLng(c.lat, c.lng)) {
    return { lat: c.lat, lng: c.lng };
  }
  const q = [c.locationText, c.city, c.district, c.state].filter(Boolean).join(", ");
  if (!q) return undefined;
  try {
    const url =
      "https://nominatim.openstreetmap.org/search?" +
      new URLSearchParams({ q: `${q}, India`, format: "json", limit: "1", countrycodes: "in" });
    const res = await fetch(url, {
      headers: { "User-Agent": "india-care-setu/0.1 (care finder)" },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return undefined;
    const data = (await res.json()) as Array<{ lat: string; lon: string }>;
    const first = data[0];
    if (!first) return undefined;
    const lat = Number.parseFloat(first.lat);
    const lng = Number.parseFloat(first.lon);
    return isValidIndiaLatLng(lat, lng) ? { lat, lng } : undefined;
  } catch {
    return undefined;
  }
}

export async function runSearch(criteria: CareCriteria): Promise<SearchResult> {
  const geo = await resolveGeo(criteria);
  const group = criteria.group;

  // Facilities: PostGIS radius when we have a point, else a plain filtered list.
  const facRes = geo
    ? await findFacilitiesNear({ lat: geo.lat, lng: geo.lng, radiusKm: RADIUS_KM, group, limit: LIMIT })
    : await listFacilities({ group, state: criteria.state, limit: LIMIT });

  const schRes = await listSchemes({ group, limit: LIMIT });
  const dbAvailable = facRes.dbAvailable && schRes.dbAvailable;

  if (dbAvailable) {
    const facilities: FinderFacility[] = geo
      ? (facRes.rows as Awaited<ReturnType<typeof findFacilitiesNear>>["rows"]).map((f) => ({
          id: f.id,
          name: f.name,
          category: f.category,
          city: f.city,
          district: f.district,
          state: f.state,
          verificationStatus: f.verificationStatus,
          residential: f.residential,
          costType: f.costType,
          distanceKm: f.distanceKm,
        }))
      : (facRes.rows as Awaited<ReturnType<typeof listFacilities>>["rows"]).map((f) => ({
          id: f.id,
          name: f.name,
          category: f.category,
          city: f.city,
          district: f.district,
          state: f.state,
          verificationStatus: f.verificationStatus,
          residential: f.residential,
          costType: f.costType,
          distanceKm: null,
        }));

    const schemes: FinderScheme[] = schRes.rows
      .filter((s) => s.governmentLevel === "central" || !criteria.state || s.state === criteria.state)
      .map((s) => ({
        id: s.id,
        schemeName: s.schemeName,
        governmentLevel: s.governmentLevel,
        state: s.state,
        ministry: s.ministry,
        beneficiaryCategory: s.beneficiaryCategory,
        eligibility: s.eligibility,
        benefits: s.benefits,
        applicationUrl: s.applicationUrl,
        officialSourceUrl: s.officialSourceUrl,
        verificationStatus: s.verificationStatus,
      }));

    return { facilities, schemes, geo, dbAvailable: true };
  }

  // ---- offline fallback: bundled sample data ----
  const facilities: FinderFacility[] = SAMPLE_FACILITIES.filter((f) => !group || f.groupSlug === group)
    .map((f) => ({
      id: f.id,
      name: f.name,
      category: f.category,
      city: f.city,
      district: f.district,
      state: f.state,
      verificationStatus: "needs_verification",
      residential: f.residential,
      costType: f.costType,
      distanceKm: geo ? haversineKm(geo, { lat: f.latitude, lng: f.longitude }) : null,
    }))
    .filter((f) => f.distanceKm == null || f.distanceKm <= RADIUS_KM)
    .sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0));

  const schemes: FinderScheme[] = SAMPLE_SCHEMES.filter((s) => !group || s.schemeGroupSlug === group)
    .filter((s) => s.governmentLevel === "central" || !criteria.state || s.state === criteria.state)
    .map((s) => ({
      id: s.id,
      schemeName: s.schemeName,
      governmentLevel: s.governmentLevel,
      state: s.state ?? null,
      ministry: s.ministry ?? null,
      beneficiaryCategory: s.beneficiaryCategory,
      eligibility: s.eligibility,
      benefits: s.benefits,
      applicationUrl: s.applicationUrl,
      officialSourceUrl: s.officialSourceUrl,
      verificationStatus: "needs_verification",
    }));

  return { facilities, schemes, geo, dbAvailable: false };
}
