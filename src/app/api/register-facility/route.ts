import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db, schema } from "@/db";
import { GAZETTEER } from "@/lib/careFinder/criteria";
import { isValidIndiaLatLng } from "@/lib/geo";

const { facilities, verifications } = schema;

export const dynamic = "force-dynamic";

type Body = {
  name?: string;
  careCategoryId?: number;
  category?: string;
  residential?: boolean;
  gender?: string;
  costType?: string;
  capacity?: number;
  services?: string;
  address?: string;
  city?: string;
  district?: string;
  state?: string;
  pincode?: string;
  phone?: string;
  email?: string;
  website?: string;
  description?: string;
  submitterName?: string;
  submitterContact?: string;
  consent?: boolean;
  company?: string; // honeypot — must be empty
};

const s = (v: unknown, max = 500): string | null => {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t ? t.slice(0, max) : null;
};

async function geocode(city: string | null, district: string | null, state: string | null, pincode: string | null) {
  if (city) {
    const p = GAZETTEER[city.toLowerCase()];
    if (p) return { lat: p.lat, lng: p.lng };
  }
  const q = [city, district, state, pincode].filter(Boolean).join(", ");
  if (!q) return null;
  try {
    const url =
      "https://nominatim.openstreetmap.org/search?" +
      new URLSearchParams({ q: `${q}, India`, format: "json", limit: "1", countrycodes: "in" });
    const res = await fetch(url, {
      headers: { "User-Agent": "india-care-setu/0.1 (center registration)" },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as Array<{ lat: string; lon: string }>;
    const first = data[0];
    if (!first) return null;
    const lat = Number.parseFloat(first.lat);
    const lng = Number.parseFloat(first.lon);
    return isValidIndiaLatLng(lat, lng) ? { lat, lng } : null;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  // Honeypot: silently accept but drop bots that fill the hidden field.
  if (s(body.company)) return NextResponse.json({ ok: true });

  const name = s(body.name, 200);
  const city = s(body.city, 120);
  const state = s(body.state, 120);
  const phone = s(body.phone, 40);
  const submitterName = s(body.submitterName, 120);
  const submitterContact = s(body.submitterContact, 200);
  const careCategoryId = Number.isInteger(body.careCategoryId) ? body.careCategoryId! : null;

  const missing: string[] = [];
  if (!name) missing.push("name");
  if (!careCategoryId) missing.push("category");
  if (!city) missing.push("city");
  if (!state) missing.push("state");
  if (!phone) missing.push("phone");
  if (!submitterName) missing.push("your name");
  if (!submitterContact) missing.push("your contact");
  if (!body.consent) missing.push("consent");
  if (missing.length) {
    return NextResponse.json({ error: `Please provide: ${missing.join(", ")}` }, { status: 400 });
  }

  const district = s(body.district, 120);
  const pincode = s(body.pincode, 10);
  const website = s(body.website, 300);
  const services = (s(body.services, 500) ?? "")
    .split(/[,;]/)
    .map((x) => x.trim())
    .filter(Boolean)
    .slice(0, 20);
  const gender = ["male", "female", "all"].includes(String(body.gender)) ? String(body.gender) : "all";
  const costType = ["free", "subsidized", "paid", "mixed"].includes(String(body.costType))
    ? String(body.costType)
    : null;

  const geo = await geocode(city, district, state, pincode);

  try {
    const [row] = await db
      .insert(facilities)
      .values({
        name: name!,
        careCategoryId,
        category: s(body.category, 120),
        gender: gender as "male" | "female" | "all",
        residential: body.residential === true ? true : body.residential === false ? false : null,
        costType: (costType as "free" | "subsidized" | "paid" | "mixed" | null) ?? undefined,
        capacity: Number.isInteger(body.capacity) ? body.capacity : undefined,
        services,
        phone,
        email: s(body.email, 200),
        address: s(body.address, 500),
        city,
        district,
        state,
        pincode,
        latitude: geo?.lat,
        longitude: geo?.lng,
        officialSourceUrl: website,
        verificationStatus: "user_submitted",
      })
      .returning({ id: facilities.id });

    // Audit trail: who submitted it, for follow-up verification.
    await db.insert(verifications).values({
      entityType: "facility",
      entityId: row.id,
      verificationType: "self_registration",
      source: "public registration form",
      verifiedBy: submitterName!,
      status: "user_submitted",
      evidence: {
        submitterName,
        submitterContact,
        description: s(body.description, 1000),
        website,
      },
    });

    revalidatePath("/care-centers");
    revalidatePath("/admin/verify");
    revalidatePath("/admin");

    return NextResponse.json({ ok: true, id: row.id, geocoded: geo != null });
  } catch {
    return NextResponse.json(
      { error: "Could not save right now. Please try again shortly." },
      { status: 500 },
    );
  }
}
