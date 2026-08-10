"""Offline tests for the transform layer (stdlib unittest; no network/DB).

Run:  cd pipeline && python -m unittest discover -s tests -v
"""
from __future__ import annotations

import json
import os
import sys
import unittest
from pathlib import Path

# Make the `ingest` package importable when run from pipeline/.
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from ingest.resources import get_resource  # noqa: E402
from ingest.transform import (  # noqa: E402
    canon_state,
    clean_text,
    parse_pincode,
    parse_int,
    valid_india_latlng,
    transform_record,
    dedupe_key,
)

FIXTURE = Path(__file__).resolve().parents[1] / "fixtures" / "old_age_homes_sample.json"


class TestCleaners(unittest.TestCase):
    def test_canon_state_aliases(self):
        self.assertEqual(canon_state("UTTAR PRADESH"), "Uttar Pradesh")
        self.assertEqual(canon_state("orissa"), "Odisha")
        self.assertEqual(canon_state("Pondicherry"), "Puducherry")
        self.assertEqual(canon_state("NCT of Delhi"), "Delhi")
        self.assertIsNone(canon_state("Unknownland"))
        self.assertIsNone(canon_state(""))

    def test_clean_text(self):
        self.assertEqual(clean_text("  a   b  "), "a b")
        self.assertIsNone(clean_text("N/A"))
        self.assertIsNone(clean_text("  --  "))

    def test_pincode(self):
        self.assertEqual(parse_pincode("Lucknow - 226001"), "226001")
        self.assertEqual(parse_pincode("605001"), "605001")
        self.assertIsNone(parse_pincode("no pin"))

    def test_parse_int(self):
        self.assertEqual(parse_int("sanctioned 30 beds"), 30)
        self.assertEqual(parse_int("1,200"), 1200)
        self.assertIsNone(parse_int("none"))

    def test_latlng_bounds(self):
        self.assertTrue(valid_india_latlng(26.8, 80.9))
        self.assertFalse(valid_india_latlng(0.0, 0.0))
        self.assertFalse(valid_india_latlng(None, 80.0))


class TestTransformRecord(unittest.TestCase):
    def setUp(self):
        self.cfg = get_resource("old_age_homes")
        self.records = json.loads(FIXTURE.read_text(encoding="utf-8"))["records"]

    def test_clean_and_normalize(self):
        s = transform_record(self.records[0], self.cfg, "data_gov_in")
        f = s.facility
        self.assertEqual(f["name"], "Shanti Vridha Ashram")  # whitespace collapsed
        self.assertEqual(f["state"], "Uttar Pradesh")
        self.assertEqual(f["pincode"], "226001")
        self.assertEqual(f["capacity"], 50)
        self.assertTrue(f["residential"])  # default from config
        self.assertEqual(f["care_category_slug"], "old-age-homes")
        self.assertAlmostEqual(f["latitude"], 26.8467, places=3)
        self.assertEqual(s.external_id, "data_gov_in:old_age_homes:1")
        self.assertEqual(s.warnings, [])

    def test_alias_state_and_missing_phone(self):
        s = transform_record(self.records[1], self.cfg, "data_gov_in")
        self.assertEqual(s.facility["state"], "Odisha")  # Orissa -> Odisha
        self.assertEqual(s.facility["pincode"], "753001")  # from pin_code
        self.assertIsNone(s.facility["phone"])  # "N/A" -> None
        self.assertEqual(s.facility["capacity"], 30)  # parsed from text

    def test_alt_field_names(self):
        s = transform_record(self.records[2], self.cfg, "data_gov_in")
        self.assertEqual(s.facility["name"], "Golden Years Residency")  # name_of_the_old_age_home
        self.assertEqual(s.facility["state"], "Puducherry")  # state_name + alias
        self.assertEqual(s.facility["pincode"], "605001")  # postal_code

    def test_bad_coords_dropped(self):
        s = transform_record(self.records[3], self.cfg, "data_gov_in")
        self.assertIsNone(s.facility["latitude"])
        self.assertIn("coords out of range; dropped", s.warnings)

    def test_missing_name_and_unknown_state(self):
        s = transform_record(self.records[4], self.cfg, "data_gov_in")
        self.assertEqual(s.facility["name"], "[Unnamed facility]")
        self.assertIn("missing name", s.warnings)
        self.assertEqual(s.facility["state"], "Unknownland")  # kept raw
        self.assertTrue(any("unrecognized state" in w for w in s.warnings))

    def test_stable_id_when_no_id_field(self):
        rec = {"name_of_old_age_home": "X", "state": "Bihar"}
        s = transform_record(rec, self.cfg, "data_gov_in")
        self.assertTrue(s.source_record_id.startswith("sha1:"))

    def test_dedupe_key(self):
        a = transform_record(self.records[0], self.cfg, "data_gov_in").facility
        b = dict(a)
        self.assertEqual(dedupe_key(a), dedupe_key(b))


if __name__ == "__main__":
    unittest.main()
