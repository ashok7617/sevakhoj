"""CLI:  python -m ingest <command> [options]

Examples:
  python -m ingest list
  python -m ingest run old_age_homes --fixture fixtures/old_age_homes_sample.json --dry-run
  python -m ingest run old_age_homes --limit 200            # live fetch + load
  python -m ingest run old_age_homes --limit 200 --geocode nominatim
"""
from __future__ import annotations

import argparse
import json
import sys

from .pipeline import run
from .resources import RESOURCES, list_resources


def main(argv=None) -> int:
    parser = argparse.ArgumentParser(prog="ingest", description="data.gov.in ingestion pipeline")
    sub = parser.add_subparsers(dest="command", required=True)

    sub.add_parser("list", help="List configured resources")

    r = sub.add_parser("run", help="Ingest a resource")
    r.add_argument("resource", help="Resource key (see `list`)")
    r.add_argument("--limit", type=int, default=100, help="Max records (default 100; 0 = all)")
    r.add_argument("--offset", type=int, default=0, help="Start offset")
    r.add_argument("--dry-run", action="store_true", help="Fetch + transform only; no DB writes")
    r.add_argument("--fixture", help="Read records from a local JSON file instead of the API")
    r.add_argument("--geocode", choices=["none", "nominatim"], default="none")
    r.add_argument("--sample", type=int, default=3, help="Sample rows to show")
    r.add_argument("--json", action="store_true", help="Print summary as JSON")

    args = parser.parse_args(argv)

    if args.command == "list":
        print("Configured resources:")
        for key in list_resources():
            cfg = RESOURCES[key]
            print("  %-26s -> %s (resource_id: %s)" % (key, cfg.care_category_slug, cfg.resource_id))
        return 0

    limit = None if args.limit == 0 else args.limit
    try:
        summary = run(
            resource_key=args.resource,
            limit=limit,
            offset=args.offset,
            dry_run=args.dry_run,
            geocode=args.geocode,
            fixture=args.fixture,
            sample=args.sample,
        )
    except Exception as e:  # surface a clean message, not a traceback
        print("error: %s" % e, file=sys.stderr)
        return 1

    if args.json:
        print(json.dumps(summary, indent=2, ensure_ascii=False))
        return 0

    print("Resource:        %s (%s)" % (summary["resource"], summary["source"]))
    print("Fetched:         %d" % summary["fetched"])
    print("With coords:     %d (geocoded %d)" % (summary["with_coords"], summary["geocoded"]))
    print("In-batch dupes:  %d" % summary["in_batch_duplicates"])
    print("With warnings:   %d" % summary["records_with_warnings"])
    if not summary["dry_run"]:
        print("Loaded:          %d inserted, %d updated (%d raw staged)"
              % (summary.get("inserted", 0), summary.get("updated", 0), summary.get("raw_staged", 0)))
    else:
        print("(dry run — no DB writes)")
    if summary.get("sample"):
        print("\nSample:")
        for s in summary["sample"]:
            warn = (" ⚠ " + "; ".join(s["warnings"])) if s["warnings"] else ""
            print("  - %s | %s, %s | pin %s%s"
                  % (s["name"], s["district"] or "?", s["state"] or "?", s["pincode"] or "?", warn))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
