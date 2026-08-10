import { NextRequest, NextResponse } from "next/server";
import { isValidIndiaLatLng } from "@/lib/geo";

export const dynamic = "force-dynamic";

/**
 * GET /api/geocode?q=<place>
 * Server-side proxy to OpenStreetMap Nominatim (keeps the required User-Agent
 * server-side and restricts results to India). For occasional place lookups
 * only — not bulk geocoding.
 */
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();
  if (!q) return NextResponse.json({ results: [] });

  const url =
    "https://nominatim.openstreetmap.org/search?" +
    new URLSearchParams({ q, format: "json", limit: "5", countrycodes: "in" });

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "india-care-setu/0.1 (care platform research)" },
      // small cache to be polite to the public endpoint
      next: { revalidate: 3600 },
    });
    if (!res.ok) return NextResponse.json({ results: [] });
    const data = (await res.json()) as Array<{ display_name: string; lat: string; lon: string }>;
    const results = data
      .map((d) => ({ name: d.display_name, lat: Number.parseFloat(d.lat), lng: Number.parseFloat(d.lon) }))
      .filter((r) => isValidIndiaLatLng(r.lat, r.lng));
    return NextResponse.json({ results });
  } catch {
    return NextResponse.json({ results: [] });
  }
}
