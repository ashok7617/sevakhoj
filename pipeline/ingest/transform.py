"""Cleaning, standardization, and normalization — pure stdlib, no I/O.

Everything here is deterministic and unit-testable without a network or DB.
"""
from __future__ import annotations

import hashlib
import json
import re
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional, Tuple

# ------------------------------------------------------------------ states

STATES_UTS: List[str] = [
    # 28 states
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
    "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya",
    "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim",
    "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand",
    "West Bengal",
    # 8 union territories
    "Andaman and Nicobar Islands", "Chandigarh",
    "Dadra and Nagar Haveli and Daman and Diu", "Delhi",
    "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry",
]


def _nkey(s: str) -> str:
    """Normalize to a comparison key: lowercase alphanumerics only."""
    return re.sub(r"[^a-z0-9]", "", (s or "").lower())


_STATE_CANON: Dict[str, str] = {_nkey(s): s for s in STATES_UTS}
# Common aliases / historical names / abbreviations seen in govt datasets.
_STATE_ALIASES: Dict[str, str] = {
    "orissa": "Odisha",
    "pondicherry": "Puducherry",
    "uttaranchal": "Uttarakhand",
    "chhatisgarh": "Chhattisgarh",
    "nctofdelhi": "Delhi",
    "delhinct": "Delhi",
    "nationalcapitalterritoryofdelhi": "Delhi",
    "newdelhi": "Delhi",
    "jandk": "Jammu and Kashmir",
    "jk": "Jammu and Kashmir",
    "jammuandkashmirut": "Jammu and Kashmir",
    "andamannicobarislands": "Andaman and Nicobar Islands",
    "andamanandnicobar": "Andaman and Nicobar Islands",
    "dadranagarhaveli": "Dadra and Nagar Haveli and Daman and Diu",
    "damananddiu": "Dadra and Nagar Haveli and Daman and Diu",
    "dadraandnagarhavelianddamananddiu": "Dadra and Nagar Haveli and Daman and Diu",
}


def canon_state(value: Optional[str]) -> Optional[str]:
    """Map a free-text state/UT name to its canonical form, or None."""
    if not value:
        return None
    k = _nkey(value)
    if not k:
        return None
    if k in _STATE_CANON:
        return _STATE_CANON[k]
    if k in _STATE_ALIASES:
        return _STATE_ALIASES[k]
    return None  # unknown -> caller keeps raw + warning


# ------------------------------------------------------------- field access

def field_lookup(record: Dict[str, Any], candidates: List[str]) -> Optional[Any]:
    """Case/spacing-insensitive lookup of the first matching candidate key."""
    norm = {_nkey(k): v for k, v in record.items()}
    for c in candidates:
        v = norm.get(_nkey(c))
        if v is not None and str(v).strip() != "":
            return v
    return None


# --------------------------------------------------------------- cleaners

def clean_text(value: Any) -> Optional[str]:
    if value is None:
        return None
    s = re.sub(r"\s+", " ", str(value)).strip()
    # Treat common null-ish placeholders as empty.
    if s.lower() in {"", "na", "n/a", "nan", "null", "none", "-", "--"}:
        return None
    return s


def parse_pincode(value: Any) -> Optional[str]:
    if value is None:
        return None
    m = re.search(r"\b(\d{6})\b", str(value))
    return m.group(1) if m else None


def parse_int(value: Any) -> Optional[int]:
    if value is None:
        return None
    m = re.search(r"-?\d+", str(value).replace(",", ""))
    return int(m.group(0)) if m else None


def parse_float(value: Any) -> Optional[float]:
    if value is None:
        return None
    try:
        return float(str(value).strip())
    except (ValueError, TypeError):
        return None


def valid_india_latlng(lat: Optional[float], lng: Optional[float]) -> bool:
    """Rough mainland+islands bounding box for sanity-checking coordinates."""
    if lat is None or lng is None:
        return False
    return 6.0 <= lat <= 37.5 and 68.0 <= lng <= 97.5


def parse_bool(value: Any, default: Optional[bool] = None) -> Optional[bool]:
    if value is None:
        return default
    s = str(value).strip().lower()
    if s in {"y", "yes", "true", "1", "residential", "available"}:
        return True
    if s in {"n", "no", "false", "0", "non-residential", "not available"}:
        return False
    return default


def split_list(value: Any) -> List[str]:
    if value is None:
        return []
    parts = re.split(r"[;,/|]", str(value))
    return [p.strip() for p in parts if p.strip()]


# ------------------------------------------------------------- config type

@dataclass
class ResourceConfig:
    """Maps one data.gov.in resource onto standardized facility fields."""
    key: str
    resource_id: str
    care_category_slug: str
    # standardized field -> candidate source field names (any case/spacing)
    field_map: Dict[str, List[str]] = field(default_factory=dict)
    id_fields: List[str] = field(default_factory=list)
    # constants / defaults applied to every record from this resource
    defaults: Dict[str, Any] = field(default_factory=dict)
    verification_status: str = "government_verified"
    facility_type: Optional[str] = None
    category_label: Optional[str] = None  # raw category label to store


# ----------------------------------------------------------- staged output

@dataclass
class StagedRecord:
    source_record_id: str
    external_id: str
    raw: Dict[str, Any]
    facility: Dict[str, Any]
    warnings: List[str] = field(default_factory=list)


def _stable_id(record: Dict[str, Any]) -> str:
    """Deterministic id for records with no natural id field."""
    blob = json.dumps(record, sort_keys=True, ensure_ascii=False, default=str)
    return "sha1:" + hashlib.sha1(blob.encode("utf-8")).hexdigest()[:16]


def transform_record(
    record: Dict[str, Any], cfg: ResourceConfig, source_key: str
) -> StagedRecord:
    """Turn one raw govt record into a standardized, staged facility."""
    warnings: List[str] = []
    fm = cfg.field_map

    def mapped(name: str) -> Optional[Any]:
        return field_lookup(record, fm[name]) if name in fm else None

    name = clean_text(mapped("name")) or clean_text(cfg.defaults.get("name"))
    if not name:
        warnings.append("missing name")
        name = "[Unnamed facility]"

    raw_state = clean_text(mapped("state"))
    state = canon_state(raw_state) or canon_state(cfg.defaults.get("state"))
    if raw_state and not state:
        warnings.append("unrecognized state: %s" % raw_state)
        state = raw_state  # keep raw so nothing is silently dropped

    lat = parse_float(mapped("latitude"))
    lng = parse_float(mapped("longitude"))
    if (lat is not None or lng is not None) and not valid_india_latlng(lat, lng):
        warnings.append("coords out of range; dropped")
        lat = lng = None

    services = split_list(mapped("services")) or list(cfg.defaults.get("services", []))

    facility: Dict[str, Any] = {
        "name": name,
        "facility_type": cfg.facility_type or clean_text(mapped("facility_type")),
        "care_category_slug": cfg.care_category_slug,
        "category": cfg.category_label or clean_text(mapped("category")),
        "sub_category": clean_text(mapped("sub_category")),
        "gender": clean_text(mapped("gender")) or cfg.defaults.get("gender", "all"),
        "age_group": clean_text(mapped("age_group")),
        "age_min": parse_int(mapped("age_min")) if "age_min" in fm else cfg.defaults.get("age_min"),
        "age_max": parse_int(mapped("age_max")) if "age_max" in fm else cfg.defaults.get("age_max"),
        "capacity": parse_int(mapped("capacity")),
        "current_occupancy": parse_int(mapped("current_occupancy")),
        "fees_inr": parse_int(mapped("fees_inr")),
        "cost_type": clean_text(mapped("cost_type")) or cfg.defaults.get("cost_type"),
        "services": services,
        "medical_services": parse_bool(mapped("medical_services"), cfg.defaults.get("medical_services", False)),
        "residential": parse_bool(mapped("residential"), cfg.defaults.get("residential", False)),
        "government_registration": clean_text(mapped("government_registration")),
        "phone": clean_text(mapped("phone")),
        "email": clean_text(mapped("email")),
        "address": clean_text(mapped("address")),
        "state": state,
        "district": clean_text(mapped("district")),
        "city": clean_text(mapped("city")),
        "pincode": parse_pincode(mapped("pincode")) or parse_pincode(mapped("address")),
        "latitude": lat,
        "longitude": lng,
        "verification_status": cfg.verification_status,
        "official_source_url": clean_text(mapped("official_source_url")) or cfg.defaults.get("official_source_url"),
    }

    # normalize gender to enum domain
    g = _nkey(str(facility["gender"]))
    facility["gender"] = {
        "male": "male", "m": "male", "boys": "male", "men": "male",
        "female": "female", "f": "female", "girls": "female", "women": "female",
    }.get(g, "all")

    # cost_type to enum domain
    if facility["cost_type"]:
        c = _nkey(str(facility["cost_type"]))
        facility["cost_type"] = {
            "free": "free", "nocost": "free", "nofee": "free",
            "subsidized": "subsidized", "subsidised": "subsidized",
            "paid": "paid", "mixed": "mixed",
        }.get(c)  # unknown -> None

    # id + traceability
    natural = field_lookup(record, cfg.id_fields) if cfg.id_fields else None
    source_record_id = clean_text(natural) or _stable_id(record)
    external_id = "%s:%s:%s" % (source_key, cfg.key, source_record_id)
    facility["external_id"] = external_id
    facility["source_record_id"] = source_record_id

    return StagedRecord(
        source_record_id=source_record_id,
        external_id=external_id,
        raw=record,
        facility=facility,
        warnings=warnings,
    )


def dedupe_key(facility: Dict[str, Any]) -> Tuple[str, str, str]:
    """Natural key for detecting duplicates across sources/re-runs."""
    return (
        _nkey(str(facility.get("name") or "")),
        facility.get("pincode") or "",
        _nkey(str(facility.get("district") or "")),
    )
