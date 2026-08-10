# India Care & Support Platform — Project Memory

## Project Vision
Create a trusted India-wide platform that helps citizens find care facilities, government schemes, financial assistance, NGOs, and support services. The platform should also help organizations discover government programs, registrations, standards, funding opportunities, and requirements for starting or operating care centers.

## Core Problem
Information about orphan/child-care centers, senior citizen homes, mental-health facilities, widow support, disability services, NGOs, and government schemes exists across Central Government, State/UT departments, district administrations, PDFs, spreadsheets, portals, and individual organization websites. It is fragmented and difficult for ordinary people to search and compare.

## Core Product
The platform should combine two major datasets:

1. Care & Support Facilities
2. Government Schemes & Assistance

The system should cover Central Government, all 28 States, all 8 Union Territories, and district/local programs where reliable information is available.

## Care Categories
- Children / Child Care Institutions
- Children's Homes
- Open Shelters
- Specialized Adoption Agencies
- Observation Homes
- Special Homes
- Places of Safety
- Women
- Widows
- Senior Citizens
- Old-age homes
- Dementia/Alzheimer's care
- Assisted living / residential senior care
- Day-care for seniors
- Mental health / psychiatric care
- Psychiatric rehabilitation
- Rehabilitation homes
- Halfway homes
- Persons with disabilities
- District Disability Rehabilitation Centres
- Special schools
- Therapy and rehabilitation centers
- Assistive-device services
- Homeless / destitute
- Rehabilitation services
- NGOs / charitable organizations
- Caregiver support

## Government Scheme Categories
The platform should index and connect users to relevant schemes for:
- Children
- Women
- Widows
- Senior citizens
- Persons with disabilities
- Mental health
- Homeless/destitute persons
- Low-income households
- Caregivers
- NGOs / organizations
- Other vulnerable groups

For every scheme, capture where possible:
- Scheme name
- Scheme code
- Government level
- Ministry
- Department
- State/UT
- District
- Beneficiary category
- Eligibility
- Age limits
- Income limits
- Benefits
- Documents required
- Application process
- Application URL
- Official source URL
- Source record ID
- Source last-updated date
- Platform verification date
- Reuse/licensing notes

## Important Government Sources to Research
Central sources:
- myScheme — Central and State/UT government schemes
- data.gov.in — Open Government Data datasets and APIs
- India.gov.in — government services and information
- NGO DARPAN — NGO/voluntary organization information
- Mission Vatsalya — child-care and institutional-care information
- Department of Social Justice & Empowerment — senior citizen programs
- Manoashraya — mental-health institutions and rehabilitation-related information
- Department of Empowerment of Persons with Disabilities (DEPwD) — disability organizations and rehabilitation resources
- Ministry of Women & Child Development
- Ministry of Health & Family Welfare
- Ministry of Rural Development
- Ministry of Housing & Urban Affairs
- Ministry of Labour & Employment
- Ministry of Tribal Affairs
- Ministry of Minority Affairs
- Ministry of Education
- Ministry of Ayush
- Ministry of Skill Development
- Other relevant Central ministries/departments

State/UT sources:
- Social Welfare Departments
- Women & Child Development Departments
- Health Departments
- Disability departments/commissionerates
- Rural Development departments
- Urban Development departments
- Tribal Welfare departments
- Minority Welfare departments
- Labour departments
- Education departments
- State-level pension and welfare portals
- District administrations
- Municipal/local government sources

## Key Product User Journeys
### I NEED HELP
User finds:
- Appropriate care facility
- Government scheme
- Financial assistance
- NGO
- Helpline
- Medical/rehabilitation service
- Nearby government office

### I RUN AN ORGANIZATION
Organization finds:
- Grants
- Government schemes
- Registration requirements
- Minimum standards
- Funding opportunities
- CSR opportunities
- Applicable licenses and approvals

### I WANT TO START A CARE CENTER
User finds:
- Type of organization to establish
- Required registrations
- Government schemes
- Funding/grants
- Minimum standards
- Licenses/approvals
- Application processes
- Government contacts
- Nearby existing centers

## Example User Search
A user could enter:
"My 68-year-old widowed mother lives in Bijnor and needs affordable residential care and financial assistance."

The platform should convert this into structured criteria such as:
- Age: 68
- Gender: Female
- Status: Widow
- Location: Bijnor, Uttar Pradesh
- Need: Residential senior care + financial assistance
- Budget: if provided

Then return:
- Relevant Central schemes
- Uttar Pradesh schemes
- District/local assistance where available
- Nearby senior homes
- Widow-support NGOs
- Government offices
- Official application links

## Proposed Data Architecture

### Organizations
Fields:
- organization_id
- name
- organization_type
- legal_structure
- registration_number
- registration_authority
- website
- phone
- email
- address
- state
- district
- city
- pincode
- latitude
- longitude
- verification_status
- last_verified

### Facilities
Fields:
- facility_id
- organization_id
- facility_type
- category
- sub_category
- gender
- age_group
- capacity
- current_occupancy
- fees
- free_or_paid
- services
- medical_services
- residential
- government_registration
- contact
- address
- location
- verification_status
- last_verified

### Government Schemes
Fields:
- scheme_id
- scheme_name
- scheme_code
- government_level
- ministry
- department
- state
- district
- beneficiary_category
- eligibility
- income_limit
- age_limit
- benefits
- documents_required
- application_process
- application_url
- official_source_url
- source_last_updated
- verified_date

### Government Sources
Fields:
- source_id
- government_level
- ministry
- department
- state
- source_name
- source_url
- api_url
- data_format
- license_or_reuse_notes
- update_frequency
- last_checked

### Verification
Fields:
- verification_id
- organization_id
- verification_type
- source
- verified_by
- verification_date
- expiry_date
- evidence
- status

## Critical Data Design Principle
Do NOT overwrite original government data.

Store:
1. Original government record
2. Standardized platform record
3. Source URL
4. Source record ID
5. Retrieval date
6. Source last-updated date
7. Verification information

This allows traceability and protects the platform when government source formats change.

## Government Data Ingestion Pipeline
Government websites / APIs / Open Data / Excel / CSV / PDF
→ Raw Government Data
→ Extraction
→ Cleaning
→ Standardization
→ Address/PIN normalization
→ Geocoding
→ Duplicate detection
→ Verification
→ Search database
→ Public website/API

## Government Data Source Master Matrix
This is the first major research deliverable.

For every Central ministry, State, UT and relevant district department, capture:
- Government level
- State/UT
- Department
- Category
- Scheme
- Facility database
- API availability
- Excel/CSV/PDF availability
- Registration data availability
- Official URL
- Data fields available
- Update frequency
- Reuse/licensing terms
- Access method
- Last checked date

## Verification Model
Use visible badges:

- Government Verified — matched directly against an official government source
- Registration Verified — registration information confirmed
- Phone Verified — organization confirmed contact information
- User Submitted — submitted but not independently verified
- Needs Verification — outdated, conflicting or questionable information

Every important government-derived record should show:
- Official source
- Last verified date

Important: Government registration must NOT be presented as an endorsement of service quality.

## Website Structure
- Home / Find Help
- Government Schemes
- Care Centers
- NGOs
- Senior Citizens
- Widows
- Women
- Children
- Mental Health
- Disability
- Homeless / Destitute
- Start a Care Center
- Donate
- Volunteer
- For Organizations

## AI Care Finder
The AI should accept natural-language requests and convert them into structured search filters.

Example:
"My mother is 75, has dementia, lives alone in Lucknow, and we can spend ₹8,000/month."

Extract:
- Age
- Gender
- Condition/need
- Location
- Budget
- Residential requirement
- Services required

Then retrieve matching records from the structured database.

AI must NOT invent government eligibility, benefits, registration status, or facility information. Answers should be grounded in source records and distinguish preliminary eligibility from official government determination.

## Technology Stack
- Frontend: Next.js + TypeScript
- Backend: Node.js / NestJS
- Database: PostgreSQL + PostGIS
- Search: PostgreSQL full-text initially; OpenSearch/Elasticsearch later
- Data processing: Python
- Maps: Google Maps or Mapbox
- AI: OpenAI API with retrieval from structured database; later RAG/agent architecture
- Cloud deployment with backups, monitoring and role-based administration
- Mobile-first web/PWA initially; native Android/iOS later if justified

## Development Roadmap

### Phase 0 — Research
Target: 2–3 weeks
Deliverables:
- Competitive research
- Taxonomy
- Government source inventory
- Reuse/licensing review
- Database design
- Government Data Source Master Matrix

### Phase 1 — MVP
Target: 4–6 weeks
Start with:
- Senior citizens
- Widows
- Children

Pilot with:
- Uttar Pradesh
- One additional state

Features:
- Search
- Maps
- Facility pages
- Government schemes
- Source attribution
- Admin dashboard

### Phase 2 — Data Engine
Target: 4–6 weeks
Build:
- API pipelines
- CSV/Excel ingestion
- PDF extraction
- Data cleaning
- Deduplication
- Geocoding
- Change detection
- Verification workflows

### Phase 3 — India Expansion
Target: Months 3–6
Add:
- 28 states
- 8 UTs
- Mental health
- Disability
- Women
- Homeless/destitute
- Rehabilitation

### Phase 4 — AI
Target: Months 4–6
Build:
- AI Care Finder
- Natural-language search
- Grounded recommendations
- Preliminary eligibility assistance

### Phase 5 — Organization Portal
Target: Months 6–9
Organizations can:
- Claim profile
- Upload documents
- Update capacity
- Update contacts
- Manage inquiries
- Manage volunteer requests
- Manage donation requests

### Phase 6 — Mobile
Target: Months 9–12
- Improve PWA
- Build Android/iOS only if user adoption justifies it

## MVP Priorities
1. Senior Citizens
2. Widows
3. Children
4. Uttar Pradesh + one additional state
5. Government Data Source Master Matrix
6. Search and map
7. Facility pages
8. Government scheme pages
9. Admin and verification dashboard

## Business Model
Keep citizen access to basic government information free.
Potential revenue:
- Verified/premium organization profiles
- Facility management SaaS
- CSR-to-organization matching
- Donation infrastructure, subject to legal/payment requirements
- Volunteer infrastructure
- Aggregated institutional analytics where legal and ethical

Do not sell or expose sensitive personal information.

## Key Metrics
- Number of verified facilities
- Number of government schemes with current official sources
- Searches resulting in relevant matches
- Facility contact/inquiry actions
- Government scheme application clicks
- Successful help connections
- Percentage of records verified within target freshness period

## Target Milestones
Month 1:
- Taxonomy
- Database architecture
- Government source registry
- First 500–1,000 records

Month 2:
- Search
- Maps
- Government scheme database
- Admin interface

Month 3:
- Public beta
- 5,000+ facilities/schemes
- 3 categories
- 2 states

Months 4–6:
- 28 states + 8 UTs
- 50,000+ records target
- AI Care Finder
- Organization claim system

Months 6–12:
- 100,000+ records target
- Mobile/PWA improvements
- NGO/CSR platform
- Organization SaaS

## Indicative MVP Budget
If outsourced:
- UI/UX: $2K–$5K
- Backend/frontend: $8K–$20K
- Data engineering: $5K–$15K
- Cloud/database: $100–$500/month initially
- AI/API: $100–$500/month initially
- Legal/privacy review: $2K–$5K
- Data verification: $2K–$5K
- Indicative initial MVP: approximately $19K–$50K

If the founder manages architecture/research and some development, cash costs can be substantially lower.

## Initial Team
- 1 full-stack developer
- 1 data engineer/Python developer
- 1 part-time UI/UX designer
- 1 researcher/data verification person
- Founder/product/data architecture

## Legal and Trust Principles
- Verify government data reuse/licensing before commercial redistribution.
- Link users to official government application portals where possible.
- Do not represent the platform as a government service.
- Clearly distinguish government registration from quality endorsement.
- Do not expose sensitive personal information.
- Use source attribution and timestamps.
- Maintain an audit trail for important data changes.
- For children and mental-health facilities, use stronger verification and safety procedures.

## Product Differentiator
The platform should not be merely a Yelp/Google-style directory.

Its differentiator is:

Government sources
→ standardized trusted data
→ facility discovery
→ scheme discovery
→ eligibility guidance
→ AI Care Finder
→ organization onboarding
→ start-a-care-center guidance

## Long-Term Vision
Build the trusted digital infrastructure for India's care and welfare ecosystem, connecting citizens, government schemes, care organizations, NGOs, donors, volunteers, and organizations.

## Next Immediate Work
1. Build the Central + 28 States + 8 UT Government Data Source Master Matrix.
2. Identify official APIs, datasets, PDFs, Excel/CSV sources and reuse terms.
3. Inventory actual fields available from each source.
4. Finalize taxonomy from real government schemas.
5. Finalize production database schema.
6. Build the first ingestion pipeline.
7. Pilot Uttar Pradesh + one additional state.
8. Build MVP search and facility pages.

## Working Project Name
India Care & Support Platform

The final brand/domain name is still to be selected.
