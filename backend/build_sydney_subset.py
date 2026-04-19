import os
import json
from pathlib import Path

import pyarrow as pa
import pyarrow.parquet as pq
from datasets import load_dataset

HF_TOKEN = os.environ["HF_TOKEN"]

DATASET_ID = "foursquare/fsq-os-places"
CONFIG = "places"
SPLIT = "train"

OUT_DIR = Path("data")
OUT_DIR.mkdir(parents=True, exist_ok=True)
OUT_FILE = OUT_DIR / "sydney_places.parquet"

SYDNEY_BBOX = {
    "min_lat": -34.20,
    "max_lat": -33.20,
    "min_lng": 150.50,
    "max_lng": 151.40,
}

BATCH_SIZE = 2000
SCAN_LOG_EVERY = 10000

SCHEMA = pa.schema([
    ("fsq_place_id", pa.string()),
    ("name", pa.string()),
    ("latitude", pa.float64()),
    ("longitude", pa.float64()),
    ("address", pa.string()),
    ("locality", pa.string()),
    ("region", pa.string()),
    ("postcode", pa.string()),
    ("admin_region", pa.string()),
    ("post_town", pa.string()),
    ("country", pa.string()),
    ("date_created", pa.string()),
    ("date_refreshed", pa.string()),
    ("date_closed", pa.string()),
    ("tel", pa.string()),
    ("website", pa.string()),
    ("email", pa.string()),
    ("twitter", pa.string()),
    ("instagram", pa.string()),
    ("fsq_category_ids_json", pa.string()),
    ("fsq_category_labels_json", pa.string()),
    ("unresolved_flags_json", pa.string()),
    ("placemaker_url", pa.string()),
])


def inside_bbox(lat: float, lng: float) -> bool:
    return (
        SYDNEY_BBOX["min_lat"] <= lat <= SYDNEY_BBOX["max_lat"]
        and SYDNEY_BBOX["min_lng"] <= lng <= SYDNEY_BBOX["max_lng"]
    )


def as_json(value) -> str:
    if value is None:
        return "[]"
    return json.dumps(value, ensure_ascii=False)


def is_closed_or_bad(row: dict) -> bool:
    flags = set(row.get("unresolved_flags") or [])
    if row.get("date_closed"):
        return True
    bad = {"closed", "delete", "doesnt_exist", "duplicate", "privatevenue", "inappropriate"}
    return any(flag in bad for flag in flags)


def keep_row(row: dict) -> bool:
    lat = row.get("latitude")
    lng = row.get("longitude")

    if lat is None or lng is None:
        return False

    if row.get("country") != "AU":
        return False

    if not inside_bbox(lat, lng):
        return False

    if is_closed_or_bad(row):
        return False

    return True


def normalize_row(row: dict) -> dict:
    return {
        "fsq_place_id": row.get("fsq_place_id"),
        "name": row.get("name"),
        "latitude": row.get("latitude"),
        "longitude": row.get("longitude"),
        "address": row.get("address"),
        "locality": row.get("locality"),
        "region": row.get("region"),
        "postcode": row.get("postcode"),
        "admin_region": row.get("admin_region"),
        "post_town": row.get("post_town"),
        "country": row.get("country"),
        "date_created": row.get("date_created"),
        "date_refreshed": row.get("date_refreshed"),
        "date_closed": row.get("date_closed"),
        "tel": row.get("tel"),
        "website": row.get("website"),
        "email": row.get("email"),
        "twitter": row.get("twitter"),
        "instagram": row.get("instagram"),
        "fsq_category_ids_json": as_json(row.get("fsq_category_ids")),
        "fsq_category_labels_json": as_json(row.get("fsq_category_labels")),
        "unresolved_flags_json": as_json(row.get("unresolved_flags")),
        "placemaker_url": row.get("placemaker_url"),
    }


def flush_batch(writer: pq.ParquetWriter | None, batch: list[dict]):
    if not batch:
        return writer

    table = pa.Table.from_pylist(batch, schema=SCHEMA)

    if writer is None:
        writer = pq.ParquetWriter(OUT_FILE, SCHEMA, compression="zstd")

    writer.write_table(table)
    return writer


def main():
    print("Starting dataset load...")

    if OUT_FILE.exists():
        OUT_FILE.unlink()

    ds = load_dataset(
        DATASET_ID,
        CONFIG,
        split=SPLIT,
        streaming=True,
        token=HF_TOKEN,
    )

    print("Dataset stream opened. Beginning scan...")

    writer = None
    batch: list[dict] = []
    kept = 0
    scanned = 0

    for row in ds:
        scanned += 1

        if scanned % SCAN_LOG_EVERY == 0:
            print(f"scanned={scanned:,} kept={kept:,}")

        if keep_row(row):
            batch.append(normalize_row(row))
            kept += 1

        if len(batch) >= BATCH_SIZE:
            writer = flush_batch(writer, batch)
            batch.clear()
            print(f"wrote batch. scanned={scanned:,} kept={kept:,}")

    writer = flush_batch(writer, batch)

    if writer is not None:
        writer.close()

    print(f"Done. Wrote {kept:,} Sydney rows to {OUT_FILE}")


if __name__ == "__main__":
    main()