"""Pluggable geocoding. Default is 'none' (use source coordinates only).

Nominatim (OpenStreetMap) is available opt-in for records lacking coordinates.
It is rate-limited to <=1 req/sec per the OSM usage policy and requires a
descriptive User-Agent. Do not use it for bulk geocoding of huge datasets —
prefer a proper geocoding provider or an offline PIN-centroid table for that.
"""
from __future__ import annotations

import json
import time
import urllib.parse
import urllib.request
from typing import Optional, Tuple


class Geocoder:
    def geocode(self, facility: dict) -> Optional[Tuple[float, float]]:
        raise NotImplementedError


class NullGeocoder(Geocoder):
    def geocode(self, facility: dict) -> Optional[Tuple[float, float]]:
        return None


class NominatimGeocoder(Geocoder):
    ENDPOINT = "https://nominatim.openstreetmap.org/search"

    def __init__(self, min_interval: float = 1.1, timeout: int = 20):
        self.min_interval = min_interval
        self.timeout = timeout
        self._last = 0.0

    def _throttle(self) -> None:
        wait = self.min_interval - (time.monotonic() - self._last)
        if wait > 0:
            time.sleep(wait)
        self._last = time.monotonic()

    def geocode(self, facility: dict) -> Optional[Tuple[float, float]]:
        parts = [
            facility.get("address"),
            facility.get("city"),
            facility.get("district"),
            facility.get("state"),
            facility.get("pincode"),
            "India",
        ]
        q = ", ".join(p for p in parts if p)
        if not q.strip(", "):
            return None
        self._throttle()
        url = self.ENDPOINT + "?" + urllib.parse.urlencode(
            {"q": q, "format": "json", "limit": 1, "countrycodes": "in"}
        )
        req = urllib.request.Request(
            url, headers={"User-Agent": "india-care-setu-ingest/0.1 (care platform research)"}
        )
        try:
            with urllib.request.urlopen(req, timeout=self.timeout) as resp:
                data = json.loads(resp.read().decode("utf-8"))
        except Exception:
            return None
        if not data:
            return None
        try:
            return float(data[0]["lat"]), float(data[0]["lon"])
        except (KeyError, ValueError, IndexError):
            return None


def make_geocoder(name: str) -> Geocoder:
    name = (name or "none").lower()
    if name == "nominatim":
        return NominatimGeocoder()
    return NullGeocoder()
