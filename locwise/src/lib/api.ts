export const API_BASE = "http://127.0.0.1:8000";

export type MatrixRow = {
  label: string;
  count: number;
  verdict: string;
};

export type CompetitorRow = {
  name: string;
  category_text: string;
  address: string;
  locality: string;
  distance_m: number;
};

export type AnalysisResponse = {
  city: string;
  lat: number;
  lng: number;
  category: string;
  subtype: string;
  score: number;
  grade: string;
  verdict: string;
  direct_competitors_1km: number;
  close_competitors_300m: number;
  poi_count_500m: number;
  poi_count_1km: number;
  foot_traffic_proxy: string;
  signals_detected: number;
  matrix: MatrixRow[];
  nearest_competitors: CompetitorRow[];
  plain_english_summary: string;
  avg_rent: number | null;
  median_income: number | null;
  safety_index: number | null;
  survival_rate_2y: number | null;
  projected_revenue_monthly: string | null;
};

export async function analyzeLocation(payload: {
  category: string;
  subtype: string;
  lat: number;
  lng: number;
}) {
  const res = await fetch(`${API_BASE}/api/analyze`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Analysis failed");
  }

  return (await res.json()) as AnalysisResponse;
}