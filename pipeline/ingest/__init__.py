"""India Care & Support — government data ingestion pipeline.

Flow (memory.md):
  data.gov.in API -> raw records -> stage -> clean -> standardize ->
  address/PIN normalize -> geocode -> dedup -> load (source_records + facilities)

Core principle: never overwrite original government data. Raw records are
preserved verbatim in `source_records`; standardized rows link back via
`external_id` / `source_id` / `source_record_id`.
"""

__all__ = ["__version__"]
__version__ = "0.1.0"

SOURCE_KEY = "data_gov_in"
DATA_GOV_IN_SOURCE_URL = "https://www.data.gov.in"
