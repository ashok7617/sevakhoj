"""data.gov.in OGD API client (stdlib urllib — no third-party deps).

API shape:  GET https://api.data.gov.in/resource/<resource_id>
            ?api-key=<key>&format=json&offset=<n>&limit=<m>
Response:   {"records": [...], "total": N, "count": M, "field": [...], ...}
"""
from __future__ import annotations

import json
import time
import urllib.error
import urllib.parse
import urllib.request
from typing import Any, Dict, Iterator, List, Optional

BASE = "https://api.data.gov.in/resource/"


class DataGovInError(RuntimeError):
    pass


class DataGovInClient:
    def __init__(self, api_key: str, timeout: int = 30, retries: int = 3):
        if not api_key:
            raise DataGovInError("DATA_GOV_IN_API_KEY is not set.")
        self.api_key = api_key
        self.timeout = timeout
        self.retries = retries

    def fetch_page(self, resource_id: str, offset: int, limit: int) -> Dict[str, Any]:
        query = urllib.parse.urlencode({
            "api-key": self.api_key,
            "format": "json",
            "offset": offset,
            "limit": limit,
        })
        url = BASE + urllib.parse.quote(resource_id) + "?" + query
        req = urllib.request.Request(url, headers={"User-Agent": "india-care-setu-ingest/0.1"})

        last_err: Optional[Exception] = None
        for attempt in range(self.retries):
            try:
                with urllib.request.urlopen(req, timeout=self.timeout) as resp:
                    return json.loads(resp.read().decode("utf-8"))
            except urllib.error.HTTPError as e:
                body = e.read().decode("utf-8", "ignore")[:200]
                if e.code in (403, 401):
                    raise DataGovInError(
                        "Auth failed (%s). Check DATA_GOV_IN_API_KEY. %s" % (e.code, body)
                    ) from e
                last_err = DataGovInError("HTTP %s: %s" % (e.code, body))
            except (urllib.error.URLError, TimeoutError) as e:  # network hiccup
                last_err = e
            time.sleep(1.5 * (attempt + 1))
        raise DataGovInError("Failed after %d retries: %s" % (self.retries, last_err))

    def iter_records(
        self,
        resource_id: str,
        page_size: int = 100,
        max_records: Optional[int] = None,
        start_offset: int = 0,
    ) -> Iterator[Dict[str, Any]]:
        """Yield records across pages until exhausted or max_records reached."""
        offset = start_offset
        fetched = 0
        total: Optional[int] = None
        while True:
            limit = page_size
            if max_records is not None:
                limit = min(page_size, max_records - fetched)
                if limit <= 0:
                    return
            page = self.fetch_page(resource_id, offset, limit)
            records: List[Dict[str, Any]] = page.get("records", []) or []
            if total is None:
                total = page.get("total")
            if not records:
                return
            for rec in records:
                yield rec
                fetched += 1
                if max_records is not None and fetched >= max_records:
                    return
            offset += len(records)
            if total is not None and offset >= total:
                return
