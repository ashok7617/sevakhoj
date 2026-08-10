/**
 * India Care & Support Platform — database schema (Drizzle ORM).
 *
 * Mirrors the data architecture in memory.md. The authoritative DDL lives in
 * migrations/*.sql (it also enables PostGIS and adds GIST / full-text indexes
 * that Drizzle does not generate). Keep the two in sync when the model changes.
 *
 * Core design principle (from memory.md): NEVER overwrite original government
 * data. Raw records are preserved in `source_records`; standardized entities
 * link back via source_id + source_record_id so every field is traceable.
 */
import {
  pgTable,
  pgEnum,
  serial,
  uuid,
  text,
  varchar,
  integer,
  doublePrecision,
  boolean,
  jsonb,
  date,
  timestamp,
  geometry,
  index,
} from "drizzle-orm/pg-core";

/* ------------------------------------------------------------------ enums */

export const governmentLevel = pgEnum("government_level", [
  "central",
  "state",
  "ut",
  "district",
  "local",
]);

/** Visible trust badges. Registration is NOT an endorsement of quality. */
export const verificationStatus = pgEnum("verification_status", [
  "government_verified",
  "registration_verified",
  "phone_verified",
  "user_submitted",
  "needs_verification",
]);

export const genderServed = pgEnum("gender_served", [
  "male",
  "female",
  "all",
  "other",
]);

export const costType = pgEnum("cost_type", [
  "free",
  "subsidized",
  "paid",
  "mixed",
]);

export const entityType = pgEnum("entity_type", [
  "organization",
  "facility",
  "scheme",
]);

/* ------------------------------------------------------------- taxonomy */

/**
 * Care categories (children's homes, old-age homes, mental-health care, …).
 * `groupSlug` buckets a category under a beneficiary group (senior_citizens,
 * children, women, widows, mental_health, disability, homeless, ngos).
 */
export const careCategories = pgTable("care_categories", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 128 }).notNull().unique(),
  name: text("name").notNull(),
  groupSlug: varchar("group_slug", { length: 64 }).notNull(),
  groupName: text("group_name").notNull(),
  description: text("description"),
  sortOrder: integer("sort_order").notNull().default(0),
});

/** Scheme beneficiary categories (children, women, senior_citizens, …). */
export const schemeCategories = pgTable("scheme_categories", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 128 }).notNull().unique(),
  name: text("name").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

/* --------------------------------------------------------- govt sources */

/**
 * Government Data Source Master Matrix (memory.md). One row per source; the
 * matrix columns record what data each source exposes, in what formats, under
 * what reuse terms, and how thoroughly the row has been researched.
 */
export const governmentSources = pgTable(
  "government_sources",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    governmentLevel: governmentLevel("government_level").notNull(),
    ministry: text("ministry"),
    department: text("department"),
    state: text("state"),
    sourceName: text("source_name").notNull(),
    sourceUrl: text("source_url").notNull(),
    apiUrl: text("api_url"),
    dataFormat: text("data_format"), // api | csv | excel | pdf | html
    licenseOrReuseNotes: text("license_or_reuse_notes"),
    updateFrequency: text("update_frequency"),
    lastChecked: timestamp("last_checked", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),

    // --- Master Matrix columns ---
    category: text("category"), // schemes | facilities | registration | mixed
    hasSchemes: boolean("has_schemes").notNull().default(false),
    hasFacilityDb: boolean("has_facility_db").notNull().default(false),
    hasRegistrationData: boolean("has_registration_data").notNull().default(false),
    hasApi: boolean("has_api").notNull().default(false),
    formats: jsonb("formats").$type<string[]>().notNull().default([]),
    dataFields: jsonb("data_fields").$type<string[]>().notNull().default([]),
    accessMethod: text("access_method"),
    /** researched | partial | skeleton */
    researchStatus: text("research_status").notNull().default("skeleton"),
    notes: text("notes"),
  },
  (t) => [
    index("government_sources_level_state_idx").on(t.governmentLevel, t.state),
    index("government_sources_research_status_idx").on(t.researchStatus),
  ],
);

/**
 * Raw government records exactly as retrieved — never mutated. Standardized
 * entities reference these for full traceability and change detection.
 */
export const sourceRecords = pgTable(
  "source_records",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    sourceId: uuid("source_id")
      .notNull()
      .references(() => governmentSources.id),
    entityType: entityType("entity_type").notNull(),
    sourceRecordId: text("source_record_id"), // id within the source, if any
    raw: jsonb("raw").notNull(),
    retrievedAt: timestamp("retrieved_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    sourceLastUpdated: date("source_last_updated"),
    mappedEntityId: uuid("mapped_entity_id"), // -> organizations/facilities/schemes
  },
  (t) => [
    index("source_records_source_idx").on(t.sourceId),
    index("source_records_entity_idx").on(t.entityType, t.mappedEntityId),
  ],
);

/* --------------------------------------------------------- organizations */

export const organizations = pgTable(
  "organizations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    organizationType: text("organization_type"),
    legalStructure: text("legal_structure"),
    registrationNumber: text("registration_number"),
    registrationAuthority: text("registration_authority"),
    website: text("website"),
    phone: text("phone"),
    email: text("email"),
    address: text("address"),
    state: text("state"),
    district: text("district"),
    city: text("city"),
    pincode: varchar("pincode", { length: 10 }),
    latitude: doublePrecision("latitude"),
    longitude: doublePrecision("longitude"),
    location: geometry("location", { type: "point", mode: "xy", srid: 4326 }),
    verificationStatus: verificationStatus("verification_status")
      .notNull()
      .default("needs_verification"),
    lastVerified: timestamp("last_verified", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index("organizations_state_district_idx").on(t.state, t.district),
    index("organizations_location_idx").using("gist", t.location),
  ],
);

/* ------------------------------------------------------------- facilities */

export const facilities = pgTable(
  "facilities",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: uuid("organization_id").references(() => organizations.id),
    name: text("name").notNull(),
    facilityType: text("facility_type"),
    careCategoryId: integer("care_category_id").references(() => careCategories.id),
    category: text("category"), // raw label as published by the source
    subCategory: text("sub_category"),
    gender: genderServed("gender").notNull().default("all"),
    ageGroup: text("age_group"),
    ageMin: integer("age_min"),
    ageMax: integer("age_max"),
    capacity: integer("capacity"),
    currentOccupancy: integer("current_occupancy"),
    feesInr: integer("fees_inr"), // approx monthly fee in INR, if known
    costType: costType("cost_type"),
    services: jsonb("services").$type<string[]>().default([]),
    medicalServices: boolean("medical_services").default(false),
    residential: boolean("residential").default(false),
    governmentRegistration: text("government_registration"),
    phone: text("phone"),
    email: text("email"),
    address: text("address"),
    state: text("state"),
    district: text("district"),
    city: text("city"),
    pincode: varchar("pincode", { length: 10 }),
    latitude: doublePrecision("latitude"),
    longitude: doublePrecision("longitude"),
    location: geometry("location", { type: "point", mode: "xy", srid: 4326 }),
    verificationStatus: verificationStatus("verification_status")
      .notNull()
      .default("needs_verification"),
    lastVerified: timestamp("last_verified", { withTimezone: true }),
    officialSourceUrl: text("official_source_url"),
    // Traceability link to the government source (set by the ingestion pipeline).
    externalId: text("external_id"), // "<source_key>:<resource>:<record_id>" (unique when set)
    sourceId: uuid("source_id").references(() => governmentSources.id),
    sourceRecordId: text("source_record_id"),
    sourceLastUpdated: date("source_last_updated"),
    retrievedAt: timestamp("retrieved_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index("facilities_state_district_idx").on(t.state, t.district),
    index("facilities_category_idx").on(t.careCategoryId),
    index("facilities_location_idx").using("gist", t.location),
    index("facilities_external_id_idx").on(t.externalId),
  ],
);

/* -------------------------------------------------------- govt schemes */

export const governmentSchemes = pgTable(
  "government_schemes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    schemeName: text("scheme_name").notNull(),
    schemeCode: text("scheme_code"),
    governmentLevel: governmentLevel("government_level").notNull(),
    ministry: text("ministry"),
    department: text("department"),
    state: text("state"),
    district: text("district"),
    beneficiaryCategory: text("beneficiary_category"),
    schemeCategoryId: integer("scheme_category_id").references(
      () => schemeCategories.id,
    ),
    eligibility: text("eligibility"),
    incomeLimitInr: integer("income_limit_inr"),
    ageMin: integer("age_min"),
    ageMax: integer("age_max"),
    benefits: text("benefits"),
    documentsRequired: jsonb("documents_required").$type<string[]>().default([]),
    applicationProcess: text("application_process"),
    applicationUrl: text("application_url"),
    officialSourceUrl: text("official_source_url"),
    sourceId: uuid("source_id").references(() => governmentSources.id),
    sourceRecordId: text("source_record_id"),
    sourceLastUpdated: date("source_last_updated"),
    verifiedDate: date("verified_date"),
    verificationStatus: verificationStatus("verification_status")
      .notNull()
      .default("needs_verification"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index("schemes_level_state_idx").on(t.governmentLevel, t.state),
    index("schemes_category_idx").on(t.schemeCategoryId),
  ],
);

/* ------------------------------------------------------- verifications */

export const verifications = pgTable(
  "verifications",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    entityType: entityType("entity_type").notNull(),
    entityId: uuid("entity_id").notNull(),
    verificationType: text("verification_type").notNull(),
    source: text("source"),
    verifiedBy: text("verified_by"),
    verificationDate: timestamp("verification_date", { withTimezone: true })
      .defaultNow()
      .notNull(),
    expiryDate: date("expiry_date"),
    evidence: jsonb("evidence"),
    status: verificationStatus("status").notNull(),
  },
  (t) => [index("verifications_entity_idx").on(t.entityType, t.entityId)],
);
