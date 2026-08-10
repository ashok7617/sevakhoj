"""Registry of data.gov.in resources we ingest, with field mappings.

Each dataset on data.gov.in is a "resource" with a UUID `resource_id`. Because
column names vary between datasets, every field maps to a LIST of candidate
source column names (matched case/spacing-insensitively by transform.py).

The `resource_id`s below are placeholders — find the real one on the dataset's
data.gov.in page (or via the catalog) and either edit it here or set an env var
`DGI_RESOURCE_<KEY>` (e.g. DGI_RESOURCE_OLD_AGE_HOMES=...). Running live with a
placeholder id errors clearly; the fixture path does not need a resource_id.
"""
from __future__ import annotations

import os
from typing import Dict, List

from .transform import ResourceConfig

PLACEHOLDER = "REPLACE_WITH_RESOURCE_ID"

# Field candidates shared across facility datasets.
_COMMON: Dict[str, List[str]] = {
    "state": ["state", "state_name", "state_ut", "state_u_t"],
    "district": ["district", "district_name"],
    "city": ["city", "town", "city_town", "place"],
    "address": ["address", "full_address", "location", "address_line", "postal_address"],
    "pincode": ["pincode", "pin_code", "pin", "postal_code"],
    "phone": ["contact_no", "phone", "phone_no", "contact_number", "mobile", "telephone", "contact"],
    "email": ["email", "email_id", "e_mail"],
    "latitude": ["latitude", "lat"],
    "longitude": ["longitude", "long", "lng", "lon"],
    "government_registration": ["registration_no", "registration_number", "reg_no"],
    "services": ["services", "facilities", "services_provided"],
    "official_source_url": ["url", "website", "source_url"],
}


def _cfg(key: str, category_slug: str, name_fields: List[str], **kw) -> ResourceConfig:
    field_map = dict(_COMMON)
    field_map["name"] = name_fields
    field_map["capacity"] = kw.pop("capacity_fields", ["capacity", "sanctioned_capacity", "no_of_beds", "beds", "total_capacity"])
    field_map.update(kw.pop("extra_fields", {}))
    return ResourceConfig(
        key=key,
        resource_id=os.environ.get("DGI_RESOURCE_" + key.upper(), PLACEHOLDER),
        care_category_slug=category_slug,
        field_map=field_map,
        id_fields=kw.pop("id_fields", ["id", "sr_no", "s_no", "sno", "serial_no"]),
        defaults=kw.pop("defaults", {}),
        facility_type=kw.pop("facility_type", None),
        category_label=kw.pop("category_label", None),
    )


RESOURCES: Dict[str, ResourceConfig] = {
    "old_age_homes": _cfg(
        "old_age_homes",
        "old-age-homes",
        ["name_of_old_age_home", "name_of_the_old_age_home", "old_age_home",
         "institution_name", "name_of_institution", "name_of_organization", "name"],
        category_label="Old-age Home",
        facility_type="Old-age Home",
        defaults={"residential": True},
    ),
    "child_care_institutions": _cfg(
        "child_care_institutions",
        "child-care-institutions",
        ["name_of_cci", "name_of_child_care_institution", "name_of_institution",
         "institution_name", "name"],
        category_label="Child Care Institution",
        facility_type="Child Care Institution",
        defaults={"residential": True, "age_min": 0, "age_max": 18},
    ),
    "disability_ddrc": _cfg(
        "disability_ddrc",
        "ddrc",
        ["name_of_ddrc", "name_of_centre", "centre_name", "name_of_institution", "name"],
        category_label="District Disability Rehabilitation Centre",
        facility_type="DDRC",
        defaults={"residential": False},
    ),
}


def get_resource(key: str) -> ResourceConfig:
    if key not in RESOURCES:
        raise KeyError(
            "Unknown resource '%s'. Available: %s" % (key, ", ".join(sorted(RESOURCES)))
        )
    return RESOURCES[key]


def list_resources() -> List[str]:
    return sorted(RESOURCES)
