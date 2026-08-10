"""Environment/config loading (stdlib only).

Reads process env first, then fills gaps from `pipeline/.env` and the project
root `.env.local` (so DATABASE_URL can be shared with the Next.js app).
"""
from __future__ import annotations

import os
from pathlib import Path
from typing import Optional


def _load_env_file(path: Path) -> None:
    if not path.exists():
        return
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, val = line.partition("=")
        key = key.strip()
        val = val.strip().strip('"').strip("'")
        os.environ.setdefault(key, val)


def load_env() -> None:
    here = Path(__file__).resolve()
    pipeline_dir = here.parents[1]        # .../pipeline
    project_root = here.parents[2]        # repo root
    _load_env_file(pipeline_dir / ".env")
    _load_env_file(project_root / ".env.local")


def get(name: str, default: Optional[str] = None) -> Optional[str]:
    return os.environ.get(name, default)


def database_url() -> Optional[str]:
    return os.environ.get("DATABASE_URL")


def data_gov_in_api_key() -> Optional[str]:
    return os.environ.get("DATA_GOV_IN_API_KEY")
