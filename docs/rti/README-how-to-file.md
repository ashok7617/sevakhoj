# How to file these RTI requests

Two drafts are provided:
- `rti-mosje-ipsrc.md` — Central (Ministry of Social Justice & Empowerment) for the IPSrC/AVYAY grant-aided senior-citizen homes list.
- `rti-up-social-welfare.md` — Uttar Pradesh Social Welfare Department for state-run/aided old-age homes.

## Steps
1. **Fill the placeholders** `[ ]` (your name, address, phone, email, date, fee mode).
2. **Central request → easiest online:** file at **https://rtionline.gov.in**
   → select *Ministry of Social Justice & Empowerment → Department of Social Justice & Empowerment*
   → paste the letter body → pay ₹10 online. Save the registration number.
3. **UP request:** file via the **UP online RTI portal** if available for your district, or send by
   **registered post / in person** to the department PIO with a ₹10 fee (Indian Postal Order or
   treasury challan). Verify the current PIO office address on the department website first.
4. **Keep proof** — the online registration number, or the postal receipt.

## What to expect
- **Reply within 30 days** (Section 7). BPL applicants: free.
- Possible small **per-page copying charges** (≈₹2/page) if they send printouts — ask for soft copy/Excel to avoid this.
- **No/*unsatisfactory* reply?** File a **First Appeal** to the First Appellate Authority (FAA) of the same
  public authority within 30 days. If still unresolved, a **Second Appeal** to the Central Information
  Commission (CIC, for MoSJE) or the UP State Information Commission (for UP).

## Tips
- Keep it specific and ask for **machine-readable (Excel/CSV)** format — that plugs straight into the
  platform's ingestion pipeline.
- Do **not** ask for beneficiaries' personal data — it's exempt (Section 8(1)(j)) and can get the whole
  request rejected.
- If a department says it isn't the right authority, it must **transfer** your request under Section 6(3)
  within 5 days — the drafts already request this.

## When the data arrives
Load it via the ingestion pipeline (`pipeline/`) or a one-off importer, attributing the RTI reply as the
source and setting `verification_status = government_verified` with the reply date as `last_verified`.
Government registration is recorded as a fact, **not** as an endorsement of service quality.
