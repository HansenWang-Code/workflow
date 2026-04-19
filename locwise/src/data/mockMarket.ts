/**
 * Deterministic mock market data based on lat/lng + subtype.
 * Replaces real backend until the cleaned dataset is wired in.
 */

import { BusinessCategory } from "./businessTypes";

function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

function rand(seed: number, min: number, max: number): number {
  const x = Math.sin(seed) * 10000;
  const f = x - Math.floor(x);
  return Math.round(min + f * (max - min));
}

export interface MarketSnapshot {
  competitorCount: number;
  avgRentPerSqft: number;     // monthly USD
  successRate2yr: number;      // %
  footTraffic: "Low" | "Moderate" | "High" | "Very High";
  medianIncome: number;
  populationDensity: number;
  safetyScore: number;         // 0-100
  expectedRevenueMin: number;  // monthly USD, low end
  expectedRevenueMax: number;  // monthly USD, high end
  neighborCounts: Record<string, number>;
}

const CATEGORY_BASE = {
  restaurant: { rent: [38, 110], success: [42, 68], revenue: [42000, 138000] },
  cafe:       { rent: [32, 95],  success: [48, 72], revenue: [22000, 78000] },
  gym:        { rent: [22, 60],  success: [55, 78], revenue: [28000, 92000] },
  clinic:     { rent: [35, 85],  success: [78, 92], revenue: [55000, 210000] },
  retail:     { rent: [40, 120], success: [38, 62], revenue: [35000, 165000] },
  coworking:  { rent: [28, 75],  success: [60, 80], revenue: [40000, 145000] },
};

export function getMarketSnapshot(
  lat: number,
  lng: number,
  category: BusinessCategory,
  subtypeId: string
): MarketSnapshot {
  const seed = hash(`${lat.toFixed(3)}_${lng.toFixed(3)}_${subtypeId}`);
  const base = CATEGORY_BASE[category];

  const rent = rand(seed + 1, base.rent[0], base.rent[1]);
  const success = rand(seed + 2, base.success[0], base.success[1]);
  const competitorCount = rand(seed + 3, 2, 38);
  const safety = rand(seed + 4, 40, 96);
  const income = rand(seed + 5, 38000, 142000);
  const density = rand(seed + 6, 1200, 18000);

  const trafficSeed = (seed + 7) % 4;
  const footTraffic = (["Low", "Moderate", "High", "Very High"] as const)[trafficSeed];

  // Revenue scales with foot traffic, density, and inverse of competitor saturation
  const trafficMult = [0.55, 0.85, 1.1, 1.35][trafficSeed];
  const competitionMult = Math.max(0.6, 1 - competitorCount / 80);
  const revLow = Math.round((base.revenue[0] * trafficMult * competitionMult) / 500) * 500;
  const revHigh = Math.round((base.revenue[1] * trafficMult * competitionMult) / 500) * 500;

  const neighborCounts: Record<string, number> = {
    office_tower: rand(seed + 10, 0, 6),
    gym: rand(seed + 11, 0, 5),
    bar: rand(seed + 12, 0, 8),
    school: rand(seed + 13, 0, 4),
    hospital: rand(seed + 14, 0, 3),
    hotel: rand(seed + 15, 0, 4),
    competitor: rand(seed + 16, 0, 7),
    cafe: rand(seed + 17, 0, 9),
    fast_food: rand(seed + 18, 0, 7),
    luxury_retail: rand(seed + 19, 0, 5),
    residential: rand(seed + 20, 1, 9),
    park: rand(seed + 21, 0, 3),
    transit: rand(seed + 22, 0, 4),
  };

  return {
    competitorCount,
    avgRentPerSqft: rent,
    successRate2yr: success,
    footTraffic,
    medianIncome: income,
    populationDensity: density,
    safetyScore: safety,
    expectedRevenueMin: revLow,
    expectedRevenueMax: revHigh,
    neighborCounts,
  };
}
