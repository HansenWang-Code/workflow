import math
from pathlib import Path

import numpy as np
import pandas as pd
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(
    app,
    resources={
        r"/api/*": {
            "origins": [
                "http://localhost:5173",
                "https://spotigy.vercel.app",
            ]
        }
    },
)

DATA_DIR = Path("data")
MERGED_FILE = DATA_DIR / "sydney_places.parquet"
PARTS_DIR = DATA_DIR / "parts"

SYDNEY_CENTER = {"lat": -33.8688, "lng": 151.2093}
SYDNEY_BBOX = {
    "min_lat": -34.20,
    "max_lat": -33.20,
    "min_lng": 150.50,
    "max_lng": 151.40,
}

SUBTYPE_KEYWORDS = {
    "Fashion Boutique": ["fashion retail", "boutique", "apparel store", "clothing store"],
    "Bookstore": ["bookstore"],
    "Specialty Grocery": ["grocery store", "specialty store", "food retail", "market"],
    "Electronics": ["electronics store", "mobile phone store", "computer store"],
    "Beauty & Cosmetics": ["cosmetics store", "beauty supply store", "perfume store"],
    "Home & Living": ["furniture store", "home store", "home decor", "housewares"],
    "Toys & Hobbies": ["toy store", "hobby store", "game store"],
    "Sports & Outdoor": ["sporting goods store", "outdoor supply store", "bicycle store"],
    "Jewelry & Accessories": ["jewelry store", "accessories store", "watch store"],
    "Pet Supplies": ["pet store", "pet supplies"],
    "Florist": ["florist", "flower shop"],
    "Convenience Store": ["convenience store"],
    "Café": ["cafe", "coffee shop"],
    "Restaurant": ["restaurant"],
    "Gym / Fitness": ["gym", "fitness center", "pilates studio", "yoga studio"],
    "Clinic": ["medical center", "clinic", "dental office", "dentist", "doctor's office"],
    "Co-working": ["coworking space", "office", "shared office"],
}

SIGNAL_BUCKETS = {
    "Dense Residential": [
        "neighborhood",
        "apartment",
        "residential",
        "housing development",
    ],
    "Office Towers": [
        "office",
        "coworking",
        "corporate",
        "business center",
    ],
    "Gyms & Studios": [
        "gym",
        "fitness",
        "pilates",
        "yoga",
        "martial arts",
        "dance studio",
    ],
    "Bars & Nightlife": [
        "bar",
        "pub",
        "night club",
        "cocktail bar",
        "brewery",
    ],
    "Schools / Universities": [
        "school",
        "college",
        "university",
        "student center",
    ],
    "Transit / Commuter": [
        "train station",
        "bus station",
        "subway",
        "metro station",
        "tram stop",
        "ferry",
    ],
}


def load_places() -> pd.DataFrame:
    if MERGED_FILE.exists():
        df = pd.read_parquet(MERGED_FILE)
    else:
        part_files = sorted(PARTS_DIR.glob("sydney_*.parquet"))
        if not part_files:
            raise FileNotFoundError(
                "No Sydney parquet found. Put data/sydney_places.parquet "
                "or data/parts/sydney_*.parquet in your project."
            )
        df = pd.concat([pd.read_parquet(f) for f in part_files], ignore_index=True)

    df = df.copy()

    text_cols = ["name", "address", "locality", "region", "postcode", "category_text"]
    for col in text_cols:
        if col in df.columns:
            df[col] = df[col].fillna("").astype(str)

    df["category_lc"] = df["category_text"].str.lower()
    df["name_lc"] = df["name"].str.lower()

    # keep only AU + Sydney bbox
    df = df[df["country"] == "AU"].copy()
    df = df[
        (df["latitude"] >= SYDNEY_BBOX["min_lat"])
        & (df["latitude"] <= SYDNEY_BBOX["max_lat"])
        & (df["longitude"] >= SYDNEY_BBOX["min_lng"])
        & (df["longitude"] <= SYDNEY_BBOX["max_lng"])
    ].copy()

    return df.reset_index(drop=True)


PLACES = load_places()


def haversine_m(lat1, lon1, lat2, lon2):
    r = 6371000.0
    lat1 = np.radians(lat1)
    lon1 = np.radians(lon1)
    lat2 = np.radians(lat2)
    lon2 = np.radians(lon2)

    dlat = lat2 - lat1
    dlon = lon2 - lon1

    a = np.sin(dlat / 2.0) ** 2 + np.cos(lat1) * np.cos(lat2) * np.sin(dlon / 2.0) ** 2
    c = 2 * np.arcsin(np.sqrt(a))
    return r * c


def in_sydney(lat, lng):
    return (
        SYDNEY_BBOX["min_lat"] <= lat <= SYDNEY_BBOX["max_lat"]
        and SYDNEY_BBOX["min_lng"] <= lng <= SYDNEY_BBOX["max_lng"]
    )


def get_keywords(subtype: str):
    if subtype in SUBTYPE_KEYWORDS:
        return SUBTYPE_KEYWORDS[subtype]
    return [subtype.lower()]


def keyword_mask(series: pd.Series, keywords):
    mask = pd.Series(False, index=series.index)
    for kw in keywords:
        mask = mask | series.str.contains(kw, case=False, na=False, regex=False)
    return mask


def grade_from_score(score):
    if score >= 70:
        return "A"
    if score >= 55:
        return "B"
    if score >= 40:
        return "C"
    if score >= 25:
        return "D"
    return "F"


def verdict_from_score(score):
    if score >= 70:
        return "PROCEED"
    if score >= 40:
        return "NEUTRAL"
    return "AVOID"


def foot_traffic_label(poi_count_500m):
    if poi_count_500m >= 180:
        return "High"
    if poi_count_500m >= 80:
        return "Moderate"
    return "Low"


def analyze_location(lat, lng, category, subtype):
    df = PLACES.copy()

    distances = haversine_m(lat, lng, df["latitude"].values, df["longitude"].values)
    df["distance_m"] = distances

    nearby_250 = df[df["distance_m"] <= 250].copy()
    nearby_500 = df[df["distance_m"] <= 500].copy()
    nearby_1000 = df[df["distance_m"] <= 1000].copy()

    keywords = get_keywords(subtype)
    competitor_mask_1000 = keyword_mask(nearby_1000["category_lc"], keywords) | keyword_mask(
        nearby_1000["name_lc"], keywords
    )
    competitors = nearby_1000[competitor_mask_1000].sort_values("distance_m").copy()

    close_competitors = competitors[competitors["distance_m"] <= 300]
    total_pois_500 = len(nearby_500)
    total_pois_1000 = len(nearby_1000)

    signal_rows = []
    total_signal_points = 0

    for label, words in SIGNAL_BUCKETS.items():
        count = int(keyword_mask(nearby_500["category_lc"], words).sum())
        total_signal_points += count

        if count >= 12:
            verdict = "PROCEED"
        elif count >= 4:
            verdict = "NEUTRAL"
        else:
            verdict = "WEAK"

        signal_rows.append(
            {
                "label": label,
                "count": count,
                "verdict": verdict,
            }
        )

    # scoring
    support_score = min(total_signal_points * 1.2, 35)
    density_score = min(total_pois_500 / 6, 25)

    competition_penalty = min(len(competitors) * 3.5 + len(close_competitors) * 6, 55)

    raw_score = 35 + support_score + density_score - competition_penalty
    final_score = max(0, min(100, round(raw_score)))

    grade = grade_from_score(final_score)
    verdict = verdict_from_score(final_score)

    nearest_competitors = competitors.head(8)[
        ["name", "category_text", "address", "locality", "distance_m"]
    ].copy()

    nearest_competitors["distance_m"] = nearest_competitors["distance_m"].round().astype(int)

    competitor_list = nearest_competitors.to_dict(orient="records")

    summary = (
        f"{subtype} in Sydney looks {verdict.lower()} at this pin. "
        f"There are {len(competitors)} similar places within 1km and "
        f"{len(close_competitors)} very close competitors within 300m. "
        f"The area has {total_pois_500} nearby POIs within 500m, which suggests "
        f"{foot_traffic_label(total_pois_500).lower()} activity. "
        f"Nearby support signals total {total_signal_points}, led by the strongest local clusters in the matrix."
    )

    return {
        "city": "Sydney, AU",
        "lat": lat,
        "lng": lng,
        "category": category,
        "subtype": subtype,
        "score": final_score,
        "grade": grade,
        "verdict": verdict,
        "direct_competitors_1km": int(len(competitors)),
        "close_competitors_300m": int(len(close_competitors)),
        "poi_count_500m": int(total_pois_500),
        "poi_count_1km": int(total_pois_1000),
        "foot_traffic_proxy": foot_traffic_label(total_pois_500),
        "signals_detected": int(total_signal_points),
        "matrix": signal_rows,
        "nearest_competitors": competitor_list,
        "plain_english_summary": summary,
        # unsupported by Foursquare-only parquet:
        "avg_rent": None,
        "median_income": None,
        "safety_index": None,
        "survival_rate_2y": None,
        "projected_revenue_monthly": None,
    }


@app.get("/api/health")
def health():
    return jsonify(
        {
            "ok": True,
            "rows_loaded": int(len(PLACES)),
            "city": "Sydney only",
        }
    )


@app.get("/api/config")
def config():
    return jsonify(
        {
            "city": "Sydney, AU",
            "center": SYDNEY_CENTER,
            "bbox": SYDNEY_BBOX,
            "subtypes": sorted(SUBTYPE_KEYWORDS.keys()),
        }
    )


@app.post("/api/analyze")
def analyze():
    data = request.get_json(force=True)

    category = data.get("category", "").strip()
    subtype = data.get("subtype", "").strip()
    lat = float(data.get("lat"))
    lng = float(data.get("lng"))

    if not subtype:
        return jsonify({"error": "Missing subtype"}), 400

    if not in_sydney(lat, lng):
        return jsonify({"error": "Pin must be inside Sydney"}), 400

    result = analyze_location(lat, lng, category, subtype)
    return jsonify(result)


if __name__ == "__main__":
    print(f"Loaded {len(PLACES):,} Sydney POIs")
    app.run(host="0.0.0.0", port=8000, debug=True)