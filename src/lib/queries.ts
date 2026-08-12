import "server-only";
import { and, or, eq, ilike, desc, sql, getTableColumns, type SQL } from "drizzle-orm";
import { db, schema } from "@/db";
import { STALE_DAYS } from "./verification";

const { facilities, careCategories, governmentSchemes, schemeCategories, governmentSources } =
  schema;

export type Source = typeof governmentSources.$inferSelect;

export type Facility = typeof facilities.$inferSelect & {
  groupSlug: string | null;
  groupName: string | null;
};
export type Scheme = typeof governmentSchemes.$inferSelect & {
  categorySlug: string | null;
};

export type Result<T> = { rows: T; dbAvailable: boolean };

/** Wrap a DB call so a missing/unreachable database degrades gracefully. */
async function safe<T>(fn: () => Promise<T>, fallback: T): Promise<Result<T>> {
  try {
    return { rows: await fn(), dbAvailable: true };
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[queries] DB unavailable:", (err as Error).message);
    }
    return { rows: fallback, dbAvailable: false };
  }
}

export function listFacilities(opts: {
  q?: string;
  group?: string;
  state?: string;
  limit?: number;
}): Promise<Result<Facility[]>> {
  const { q, group, state, limit = 60 } = opts;
  const conds: (SQL | undefined)[] = [];
  if (q) {
    conds.push(
      or(
        ilike(facilities.name, `%${q}%`),
        ilike(facilities.city, `%${q}%`),
        ilike(facilities.district, `%${q}%`),
        ilike(facilities.category, `%${q}%`),
      ),
    );
  }
  if (group) conds.push(eq(careCategories.groupSlug, group));
  if (state) conds.push(eq(facilities.state, state));

  return safe(
    () =>
      db
        .select({
          ...getTableColumns(facilities),
          groupSlug: careCategories.groupSlug,
          groupName: careCategories.groupName,
        })
        .from(facilities)
        .leftJoin(careCategories, eq(facilities.careCategoryId, careCategories.id))
        .where(conds.length ? and(...conds) : undefined)
        .orderBy(desc(facilities.updatedAt))
        .limit(limit) as Promise<Facility[]>,
    [],
  );
}

/** Distinct states that have at least one facility (for the state filter). */
export function listFacilityStates(): Promise<Result<string[]>> {
  return safe(async () => {
    const rows = await db
      .selectDistinct({ state: facilities.state })
      .from(facilities)
      .where(sql`${facilities.state} is not null and ${facilities.state} <> ''`)
      .orderBy(facilities.state);
    return rows.map((r) => r.state).filter((s): s is string => Boolean(s));
  }, []);
}

export function getFacility(id: string): Promise<Result<Facility | null>> {
  return safe(async () => {
    const rows = (await db
      .select({
        ...getTableColumns(facilities),
        groupSlug: careCategories.groupSlug,
        groupName: careCategories.groupName,
      })
      .from(facilities)
      .leftJoin(careCategories, eq(facilities.careCategoryId, careCategories.id))
      .where(eq(facilities.id, id))
      .limit(1)) as Facility[];
    return rows[0] ?? null;
  }, null);
}

export function listSchemes(opts: {
  q?: string;
  group?: string;
  level?: string;
  state?: string;
  limit?: number;
}): Promise<Result<Scheme[]>> {
  const { q, group, level, state, limit = 60 } = opts;
  const conds: (SQL | undefined)[] = [];
  if (q) {
    conds.push(
      or(
        ilike(governmentSchemes.schemeName, `%${q}%`),
        ilike(governmentSchemes.beneficiaryCategory, `%${q}%`),
        ilike(governmentSchemes.benefits, `%${q}%`),
      ),
    );
  }
  if (group) conds.push(eq(schemeCategories.slug, group));
  if (level)
    conds.push(
      eq(
        governmentSchemes.governmentLevel,
        level as "central" | "state" | "ut" | "district" | "local",
      ),
    );
  if (state) conds.push(eq(governmentSchemes.state, state));

  return safe(
    () =>
      db
        .select({
          ...getTableColumns(governmentSchemes),
          categorySlug: schemeCategories.slug,
        })
        .from(governmentSchemes)
        .leftJoin(
          schemeCategories,
          eq(governmentSchemes.schemeCategoryId, schemeCategories.id),
        )
        .where(conds.length ? and(...conds) : undefined)
        .orderBy(desc(governmentSchemes.updatedAt))
        .limit(limit) as Promise<Scheme[]>,
    [],
  );
}

/** Distinct states that have at least one state-level scheme (for the filter). */
export function listSchemeStates(): Promise<Result<string[]>> {
  return safe(async () => {
    const rows = await db
      .selectDistinct({ state: governmentSchemes.state })
      .from(governmentSchemes)
      .where(sql`${governmentSchemes.state} is not null and ${governmentSchemes.state} <> ''`)
      .orderBy(governmentSchemes.state);
    return rows.map((r) => r.state).filter((s): s is string => Boolean(s));
  }, []);
}

export type NearbyFacility = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  category: string | null;
  groupSlug: string | null;
  groupName: string | null;
  verificationStatus: string;
  city: string | null;
  district: string | null;
  state: string | null;
  residential: boolean | null;
  costType: string | null;
  distanceKm: number;
};

/**
 * Facilities within `radiusKm` of a point, nearest first (PostGIS ST_DWithin +
 * ST_Distance on the geography cast, using the GIST index on `location`).
 */
export function findFacilitiesNear(opts: {
  lat: number;
  lng: number;
  radiusKm: number;
  group?: string;
  q?: string;
  limit?: number;
}): Promise<Result<NearbyFacility[]>> {
  const { lat, lng, radiusKm, group, q, limit = 100 } = opts;
  const radiusM = radiusKm * 1000;
  const point = sql`ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography`;
  const groupFilter = group ? sql`AND cc.group_slug = ${group}` : sql``;
  const qFilter = q
    ? sql`AND (f.name ILIKE ${"%" + q + "%"} OR f.category ILIKE ${"%" + q + "%"})`
    : sql``;

  return safe(async () => {
    const rows = await db.execute(sql`
      SELECT f.id AS "id", f.name AS "name",
             f.latitude AS "latitude", f.longitude AS "longitude",
             f.category AS "category",
             cc.group_slug AS "groupSlug", cc.group_name AS "groupName",
             f.verification_status AS "verificationStatus",
             f.city AS "city", f.district AS "district", f.state AS "state",
             f.residential AS "residential", f.cost_type AS "costType",
             ST_Distance(f.location::geography, ${point}) / 1000.0 AS "distanceKm"
      FROM facilities f
      LEFT JOIN care_categories cc ON cc.id = f.care_category_id
      WHERE f.location IS NOT NULL
        AND ST_DWithin(f.location::geography, ${point}, ${radiusM})
        ${groupFilter}
        ${qFilter}
      ORDER BY "distanceKm" ASC
      LIMIT ${limit}
    `);
    return rows as unknown as NearbyFacility[];
  }, []);
}

/** Government Data Source Master Matrix rows, with optional filters. */
export function listSources(opts: {
  q?: string;
  level?: string;
  state?: string;
  status?: string;
  category?: string;
}): Promise<Result<Source[]>> {
  const { q, level, state, status, category } = opts;
  const conds: (SQL | undefined)[] = [];
  if (q) {
    conds.push(
      or(
        ilike(governmentSources.sourceName, `%${q}%`),
        ilike(governmentSources.department, `%${q}%`),
        ilike(governmentSources.ministry, `%${q}%`),
        ilike(governmentSources.notes, `%${q}%`),
      ),
    );
  }
  if (level)
    conds.push(
      eq(
        governmentSources.governmentLevel,
        level as "central" | "state" | "ut" | "district" | "local",
      ),
    );
  if (state) conds.push(eq(governmentSources.state, state));
  if (status) conds.push(eq(governmentSources.researchStatus, status));
  if (category) conds.push(eq(governmentSources.category, category));

  return safe(
    () =>
      db
        .select()
        .from(governmentSources)
        .where(conds.length ? and(...conds) : undefined)
        .orderBy(
          governmentSources.governmentLevel,
          governmentSources.state,
          governmentSources.sourceName,
        )
        .limit(1000),
    [],
  );
}

/* ------------------------------------------------ verification dashboard */

export type VerificationOverview = {
  facilities: {
    total: number;
    byStatus: Record<string, number>;
    stale: number;
    fresh: number;
    noSource: number;
  };
  schemes: { total: number; byStatus: Record<string, number> };
  recentVerifications: number;
};

export function verificationOverview(): Promise<Result<VerificationOverview>> {
  const zero: VerificationOverview = {
    facilities: { total: 0, byStatus: {}, stale: 0, fresh: 0, noSource: 0 },
    schemes: { total: 0, byStatus: {} },
    recentVerifications: 0,
  };
  return safe(async () => {
    const facRows = (await db.execute(sql`
      SELECT
        count(*)::int AS total,
        count(*) FILTER (WHERE verification_status='needs_verification')::int AS needs_verification,
        count(*) FILTER (WHERE verification_status='user_submitted')::int AS user_submitted,
        count(*) FILTER (WHERE verification_status='phone_verified')::int AS phone_verified,
        count(*) FILTER (WHERE verification_status='registration_verified')::int AS registration_verified,
        count(*) FILTER (WHERE verification_status='government_verified')::int AS government_verified,
        count(*) FILTER (
          WHERE verification_status IN ('government_verified','registration_verified','phone_verified')
            AND (last_verified IS NULL OR last_verified < now() - make_interval(days => ${STALE_DAYS}))
        )::int AS stale,
        count(*) FILTER (
          WHERE verification_status IN ('government_verified','registration_verified','phone_verified')
            AND last_verified >= now() - make_interval(days => ${STALE_DAYS})
        )::int AS fresh,
        count(*) FILTER (WHERE source_id IS NULL AND official_source_url IS NULL)::int AS no_source
      FROM facilities
    `)) as unknown as Array<Record<string, number>>;
    const f = facRows[0] ?? {};

    const schRows = await db
      .select({ status: governmentSchemes.verificationStatus, n: sql<number>`count(*)::int` })
      .from(governmentSchemes)
      .groupBy(governmentSchemes.verificationStatus);

    const recent = (await db.execute(
      sql`SELECT count(*)::int AS n FROM verifications WHERE verification_date >= now() - make_interval(days => 30)`,
    )) as unknown as Array<{ n: number }>;

    const schByStatus: Record<string, number> = {};
    let schTotal = 0;
    for (const r of schRows) {
      schByStatus[r.status] = r.n;
      schTotal += r.n;
    }

    return {
      facilities: {
        total: f.total ?? 0,
        byStatus: {
          needs_verification: f.needs_verification ?? 0,
          user_submitted: f.user_submitted ?? 0,
          phone_verified: f.phone_verified ?? 0,
          registration_verified: f.registration_verified ?? 0,
          government_verified: f.government_verified ?? 0,
        },
        stale: f.stale ?? 0,
        fresh: f.fresh ?? 0,
        noSource: f.no_source ?? 0,
      },
      schemes: { total: schTotal, byStatus: schByStatus },
      recentVerifications: recent[0]?.n ?? 0,
    };
  }, zero);
}

export type QueueFacility = {
  id: string;
  name: string;
  category: string | null;
  groupName: string | null;
  state: string | null;
  district: string | null;
  verificationStatus: string;
  lastVerified: Date | null;
  officialSourceUrl: string | null;
  sourceRecordId: string | null;
};

export function listFacilityQueue(opts: {
  status?: string;
  q?: string;
  limit?: number;
}): Promise<Result<QueueFacility[]>> {
  const { status, q, limit = 100 } = opts;
  const conds: (SQL | undefined)[] = [];
  if (status)
    conds.push(
      eq(
        facilities.verificationStatus,
        status as "government_verified" | "registration_verified" | "phone_verified" | "user_submitted" | "needs_verification",
      ),
    );
  if (q) conds.push(or(ilike(facilities.name, `%${q}%`), ilike(facilities.city, `%${q}%`)));

  return safe(
    () =>
      db
        .select({
          id: facilities.id,
          name: facilities.name,
          category: facilities.category,
          groupName: careCategories.groupName,
          state: facilities.state,
          district: facilities.district,
          verificationStatus: facilities.verificationStatus,
          lastVerified: facilities.lastVerified,
          officialSourceUrl: facilities.officialSourceUrl,
          sourceRecordId: facilities.sourceRecordId,
        })
        .from(facilities)
        .leftJoin(careCategories, eq(facilities.careCategoryId, careCategories.id))
        .where(conds.length ? and(...conds) : undefined)
        .orderBy(
          sql`case ${facilities.verificationStatus} when 'needs_verification' then 0 when 'user_submitted' then 1 else 2 end`,
          sql`${facilities.lastVerified} asc nulls first`,
        )
        .limit(limit),
    [],
  );
}

export type QueueScheme = {
  id: string;
  schemeName: string;
  governmentLevel: string;
  state: string | null;
  verificationStatus: string;
  verifiedDate: string | null;
  officialSourceUrl: string | null;
};

export function listSchemeQueue(opts: {
  status?: string;
  q?: string;
  limit?: number;
}): Promise<Result<QueueScheme[]>> {
  const { status, q, limit = 100 } = opts;
  const conds: (SQL | undefined)[] = [];
  if (status)
    conds.push(
      eq(
        governmentSchemes.verificationStatus,
        status as "government_verified" | "registration_verified" | "phone_verified" | "user_submitted" | "needs_verification",
      ),
    );
  if (q) conds.push(ilike(governmentSchemes.schemeName, `%${q}%`));

  return safe(
    () =>
      db
        .select({
          id: governmentSchemes.id,
          schemeName: governmentSchemes.schemeName,
          governmentLevel: governmentSchemes.governmentLevel,
          state: governmentSchemes.state,
          verificationStatus: governmentSchemes.verificationStatus,
          verifiedDate: governmentSchemes.verifiedDate,
          officialSourceUrl: governmentSchemes.officialSourceUrl,
        })
        .from(governmentSchemes)
        .where(conds.length ? and(...conds) : undefined)
        .orderBy(
          sql`case ${governmentSchemes.verificationStatus} when 'needs_verification' then 0 when 'user_submitted' then 1 else 2 end`,
          desc(governmentSchemes.updatedAt),
        )
        .limit(limit) as Promise<QueueScheme[]>,
    [],
  );
}

export type CareCategoryOption = {
  id: number;
  name: string;
  groupSlug: string;
  groupName: string;
};

/** Care categories for the registration form's grouped select. */
export function listCareCategories(): Promise<Result<CareCategoryOption[]>> {
  return safe(
    () =>
      db
        .select({
          id: careCategories.id,
          name: careCategories.name,
          groupSlug: careCategories.groupSlug,
          groupName: careCategories.groupName,
        })
        .from(careCategories)
        .orderBy(careCategories.sortOrder),
    [],
  );
}

/** Facility counts per beneficiary group (for landing tiles). */
export function countByGroup(): Promise<Result<Record<string, number>>> {
  return safe(async () => {
    const rows = await db
      .select({
        group: careCategories.groupSlug,
        n: sql<number>`count(*)::int`,
      })
      .from(facilities)
      .leftJoin(careCategories, eq(facilities.careCategoryId, careCategories.id))
      .groupBy(careCategories.groupSlug);
    const out: Record<string, number> = {};
    for (const r of rows) if (r.group) out[r.group] = r.n;
    return out;
  }, {});
}
