export type Verdict = "great" | "proceed" | "caution" | "avoid";

export interface Signal {
  id: string;
  label: string;
  count: number;
  score: number;
  verdict: Verdict;
  reason: string;
}

export interface OverallResult {
  score: number;
  grade: string;
  verdict: Verdict;
}

const RULES: Record<string, { label: string; score: number; reason: string }> = {
  office_tower: { label: "Office Buildings", score: +15, reason: "Workers = reliable weekday demand and repeat customers." },
  hotel: { label: "Hotels & Lodging", score: +10, reason: "Guests need nearby food, retail, and services daily." },
  transit: { label: "Transit Stops", score: +12, reason: "Commuter flow drives discovery and walk-in traffic." },
  residential: { label: "Residential Buildings", score: +8, reason: "Locals become regulars — the backbone of steady revenue." },
  luxury_retail: { label: "Luxury Retail", score: +10, reason: "Signals high-income foot traffic and spending power." },
  park: { label: "Parks & Green Space", score: +6, reason: "Parks attract foot traffic and improve neighborhood appeal." },
  school: { label: "Schools & Universities", score: +5, reason: "Students and staff create consistent weekday demand." },
  competitor: { label: "Direct Competitors", score: -18, reason: "Same concept nearby splits your potential customer base." },
  bar: { label: "Bars & Nightlife", score: -8, reason: "Attracts a different crowd and raises safety perception risk." },
  fast_food: { label: "Fast Food Chains", score: -6, reason: "Price anchoring nearby reduces willingness to spend more." },
  gym: { label: "Gyms & Fitness Studios", score: +4, reason: "Health-conscious foot traffic — good for cafes and health brands." },
  cafe: { label: "Cafes & Coffee Shops", score: -5, reason: "Coffee saturation nearby increases your acquisition cost." },
  hospital: { label: "Hospitals & Clinics", score: +3, reason: "Steady visitor and staff traffic throughout the day." },
};

export function scoreNeighbors(_subtypeId: string, neighborCounts: Record<string, number>): Signal[] {
  const signals: Signal[] = [];
  for (const [id, count] of Object.entries(neighborCounts)) {
    if (count === 0) continue;
    const rule = RULES[id];
    if (!rule) continue;
    const rawScore = rule.score * count;
    signals.push({ id, label: rule.label, count, score: rawScore, verdict: getVerdict(rawScore), reason: rule.reason });
  }
  return signals.sort((a, b) => a.score - b.score);
}

export function overallScore(signals: Signal[]): OverallResult {
  const total = signals.reduce((sum, s) => sum + s.score, 0);
  const clamped = Math.max(-100, Math.min(100, total));
  const grade = clamped >= 60 ? "A" : clamped >= 30 ? "B" : clamped >= 0 ? "C" : clamped >= -30 ? "D" : "F";
  const verdict = clamped >= 40 ? "great" : clamped >= 10 ? "proceed" : clamped >= -20 ? "caution" : "avoid";
  return { score: clamped, grade, verdict };
}

export function verdictLabel(verdict: Verdict): string {
  switch (verdict) {
    case "great": return "Great";
    case "proceed": return "Proceed";
    case "caution": return "Caution";
    case "avoid": return "Avoid";
  }
}

export function verdictTone(verdict: Verdict): string {
  switch (verdict) {
    case "great": return "text-signal-green border-signal-green";
    case "proceed": return "text-accent border-accent";
    case "caution": return "text-signal-amber border-signal-amber";
    case "avoid": return "text-signal-red border-signal-red";
  }
}

function getVerdict(score: number): Verdict {
  if (score >= 10) return "great";
  if (score >= 0) return "proceed";
  if (score >= -10) return "caution";
  return "avoid";
}