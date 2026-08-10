import { NextRequest, NextResponse } from "next/server";
import { findFacilitiesNear, type NearbyFacility } from "@/lib/queries";
import { SAMPLE_FACILITIES } from "@/data/sampleFacilities";
import { haversineKm } from "@/lib/geo";

export const dynamic = "force-dynamic";

/**
 * GET /api/facilities/near?lat=&lng=&radius=&group=&q=
 * Facilities within `radius` km of (lat,lng), nearest first (PostGIS).
 * Falls back to the in-repo SAMPLE facilities (haversine) when the DB is down,
 * so the map is demoable without Postgres.
 */
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const lat = Number.parseFloat(sp.get("lat") ?? "");
  const lng = Number.parseFloat(sp.get("lng") ?? "");
  const radiusKm = clamp(Number.parseFloat(sp.get("radius") ?? "10"), 0.5, 200);
  const group = sp.get("group")?.trim() || undefined;
  const q = sp.get("q")?.trim() || undefined;

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return NextResponse.json({ error: "lat and lng are required" }, { status: 400 });
  }

  const { rows, dbAvailable } = await findFacilitiesNear({ lat, lng, radiusKm, group, q });
  if (dbAvailable) {
    return NextResponse.json({ facilities: rows, dbAvailable: true, fallback: false });
  }

  // --- offline fallback: sample data via haversine ---
  const ql = q?.toLowerCase();
  const facilities: NearbyFacility[] = SAMPLE_FACILITIES.filter(
    (f) => (!group || f.groupSlug === group) &&
      (!ql || `${f.name} ${f.category}`.toLowerCase().includes(ql)),
  )
    .map((f) => ({
      id: f.id,
      name: f.name,
      latitude: f.latitude,
      longitude: f.longitude,
      category: f.category,
      groupSlug: f.groupSlug,
      groupName: null,
      verificationStatus: "needs_verification",
      city: f.city,
      district: f.district,
      state: f.state,
      residential: f.residential,
      costType: f.costType,
      distanceKm: haversineKm({ lat, lng }, { lat: f.latitude, lng: f.longitude }),
    }))
    .filter((f) => f.distanceKm <= radiusKm)
    .sort((a, b) => a.distanceKm - b.distanceKm);

  return NextResponse.json({ facilities, dbAvailable: false, fallback: true });
}

function clamp(n: number, lo: number, hi: number): number {
  if (!Number.isFinite(n)) return lo;
  return Math.min(hi, Math.max(lo, n));
}
