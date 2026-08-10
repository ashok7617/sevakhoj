import { NextRequest, NextResponse } from "next/server";
import { extractCriteria } from "@/lib/careFinder/extract";
import { runSearch } from "@/lib/careFinder/search";

export const dynamic = "force-dynamic";

/**
 * POST /api/care-finder  { query: string }
 * 1) parse the request into structured criteria (LLM or rule-based),
 * 2) retrieve matching facilities + schemes deterministically from the DB.
 * The response is grounded in stored records — no eligibility/benefits are
 * invented. Eligibility shown is preliminary; confirm on the official source.
 */
export async function GET() {
  return NextResponse.json({ error: "Use POST with { query }" }, { status: 405 });
}

export async function POST(req: NextRequest) {
  let body: { query?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const query = body.query?.trim();
  if (!query) return NextResponse.json({ error: "query is required" }, { status: 400 });
  if (query.length > 1000) {
    return NextResponse.json({ error: "query too long" }, { status: 400 });
  }

  const { criteria, method } = await extractCriteria(query);
  const { facilities, schemes, geo, dbAvailable } = await runSearch(criteria);

  return NextResponse.json({
    criteria,
    method, // "llm" | "rules"
    facilities,
    schemes,
    geo: geo ?? null,
    dbAvailable,
  });
}
