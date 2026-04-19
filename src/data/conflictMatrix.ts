/**
 * CONFLICT MATRIX
 * Pure logic. No API. Scores nearby business types against the user's chosen subtype.
 *
 * Verdicts: -2 avoid · -1 caution · 0 neutral · +1 proceed · +2 great
 */

export type Verdict = -2 | -1 | 0 | 1 | 2;

export const verdictLabel = (v: Verdict): string =>
  ({ "-2": "AVOID", "-1": "CAUTION", "0": "NEUTRAL", "1": "PROCEED", "2": "GREAT" } as const)[
    String(v) as "-2" | "-1" | "0" | "1" | "2"
  ];

export const verdictTone = (v: Verdict): string =>
  ({
    "-2": "text-signal-red border-signal-red",
    "-1": "text-signal-amber border-signal-amber",
    "0": "text-muted-foreground border-border-strong",
    "1": "text-signal-blue border-signal-blue",
    "2": "text-signal-green border-signal-green",
  } as const)[String(v) as "-2" | "-1" | "0" | "1" | "2"];

export interface NeighborSignal {
  id: string;
  label: string;
  count: number;
  verdict: Verdict;
  reason: string;
}

/**
 * Matrix: subtype -> neighborKey -> [verdict, reason]
 * Neighbor categories represent surrounding business signals.
 */
type MatrixEntry = [Verdict, string];

const NEIGHBOR_LABEL: Record<string, string> = {
  office_tower: "Office Towers",
  gym: "Gyms & Studios",
  bar: "Bars & Nightlife",
  school: "Schools / Universities",
  hospital: "Hospitals & Clinics",
  hotel: "Hotels",
  competitor: "Direct Competitors",
  cafe: "Cafés",
  fast_food: "Fast Food Chains",
  luxury_retail: "Luxury Retail",
  residential: "Dense Residential",
  park: "Parks & Green Space",
  transit: "Transit Hubs",
};

// Defaults applied if subtype not specified
const DEFAULT_RULES: Record<string, MatrixEntry> = {
  competitor: [-1, "Direct competitors split the same demand pool."],
  transit: [1, "Transit foot traffic helps most categories."],
  residential: [1, "Resident base supports repeat visits."],
};

const RULES: Record<string, Record<string, MatrixEntry>> = {
  // ── Restaurants
  thai: {
    office_tower: [2, "Lunch demand from office workers is ideal for Thai bowls."],
    gym: [1, "Health-conscious gym crowd overlaps with Thai diners."],
    bar: [1, "Late-night Thai pairs well with bar-hoppers."],
    competitor: [-1, "Existing Thai spots fragment the niche."],
    fast_food: [-1, "Heavy fast food signals price-sensitive area."],
    luxury_retail: [1, "Affluent shoppers spend on lunch."],
    transit: [2, "Commuter flow drives lunch + early dinner."],
  },
  vegan: {
    gym: [2, "Gym-goers are your highest-intent customer."],
    fast_food: [-2, "Fast food density signals wrong customer profile."],
    cafe: [1, "Cafés indicate health-aware foot traffic."],
    office_tower: [1, "Office lunch demand favors fast vegan."],
    luxury_retail: [2, "High-income shoppers seek premium plant-based."],
    bar: [-1, "Heavy nightlife rarely converts for vegan."],
    school: [1, "Universities skew toward vegan-curious."],
  },
  fast_food: {
    office_tower: [2, "High-volume lunch demand is gold."],
    school: [2, "Students drive consistent volume."],
    transit: [2, "Commuter convenience = repeat sales."],
    gym: [-2, "Fitness crowd actively avoids fast food."],
    luxury_retail: [-1, "Wrong demographic for QSR pricing."],
    competitor: [-2, "QSR margins collapse with direct competition."],
    bar: [1, "Late-night munchies."],
  },
  fine_dining: {
    luxury_retail: [2, "Aligns with destination spending."],
    hotel: [2, "Hotel guests are pre-qualified diners."],
    fast_food: [-2, "Brand-adjacent QSR damages perception."],
    office_tower: [1, "Expense-account dinners help."],
    bar: [1, "Pre/post-dinner bar trade is healthy."],
    residential: [-1, "Pure residential lacks special-occasion volume."],
  },
  italian: {
    residential: [2, "Family dinners are the bread and butter."],
    bar: [1, "Wine-forward menus pair with nightlife."],
    office_tower: [1, "Lunch trade is steady."],
    competitor: [-1, "Italian saturation is real."],
    luxury_retail: [1, "Trattoria fits affluent strolls."],
  },
  japanese: {
    office_tower: [2, "Sushi lunch is a category staple."],
    luxury_retail: [2, "Premium positioning aligns."],
    hotel: [1, "Tourist appeal helps."],
    fast_food: [-1, "QSR-heavy areas signal wrong price tier."],
    gym: [1, "Health-aware crowd loves Japanese."],
  },
  mexican: {
    school: [2, "Students adore Mexican."],
    bar: [2, "Margaritas = strong beverage attach."],
    office_tower: [1, "Bowls and burritos travel well."],
    residential: [1, "Family-friendly menu."],
    competitor: [-1, "Density compresses margins."],
  },
  // ── Cafés
  specialty_coffee: {
    coworking: [2, "Coworking = guaranteed daily customer."],
    office_tower: [2, "Morning rush + afternoon meetings."],
    gym: [1, "Post-workout protein lattes."],
    competitor: [-1, "Other specialty cafés split early adopters."],
    luxury_retail: [2, "Affluent shoppers pay $7 for pour-over."],
    fast_food: [-1, "QSR-heavy areas favor Dunkin' over $6 lattes."],
    school: [2, "Students = afternoon laptop crowd."],
    park: [1, "Weekend takeaway business."],
  },
  brunch: {
    residential: [2, "Weekend locals walk to brunch."],
    park: [2, "Park-adjacent brunch is destination-worthy."],
    office_tower: [-1, "Office areas die on weekends."],
    competitor: [-1, "Brunch loyalty is fickle when alternatives exist."],
    luxury_retail: [1, "Shopping + brunch is a known pairing."],
  },
  boba: {
    school: [2, "Universities and high schools are core market."],
    competitor: [-1, "Boba crowds out fast in saturated markets."],
    transit: [1, "Walk-up convenience matters."],
    office_tower: [1, "Afternoon pick-me-up."],
  },
  bakery: {
    residential: [2, "Daily morning ritual."],
    transit: [2, "Commuter grab-and-go."],
    office_tower: [1, "Meeting pastries + coffee."],
    park: [1, "Weekend strollers."],
  },
  // ── Gyms
  boutique: {
    luxury_retail: [2, "Affluent area = $40 class buyers."],
    office_tower: [1, "After-work classes fill up."],
    cafe: [1, "Café-gym pairing is a known synergy."],
    residential: [2, "Walk-to-class members are sticky."],
    competitor: [-1, "Boutique fitness saturates fast."],
    fast_food: [-1, "Wrong demographic profile."],
  },
  crossfit: {
    residential: [1, "Drive-in members from nearby blocks."],
    office_tower: [1, "Pre-work and after-work classes."],
    competitor: [-2, "CrossFit boxes cannibalize each other."],
    luxury_retail: [0, "Neutral for premium boxes."],
  },
  bigbox: {
    residential: [2, "Membership volume requires density."],
    transit: [2, "24/7 access means transit users stop in."],
    competitor: [-1, "Pricing wars in saturated areas."],
    luxury_retail: [-1, "Premium areas prefer boutique."],
  },
  martial: {
    school: [2, "Kids' classes drive enrollment."],
    residential: [2, "Family-friendly clientele."],
    competitor: [-1, "Style-on-style competition is real."],
  },
  // ── Clinics
  dental: {
    office_tower: [2, "Convenient lunchtime appointments."],
    residential: [2, "Family practice depends on locals."],
    competitor: [-1, "Insurance networks limit overflow."],
    transit: [1, "Easy access matters."],
  },
  physio: {
    gym: [2, "Direct referral pipeline."],
    hospital: [2, "Post-op referrals."],
    office_tower: [1, "Desk-job back pain is your market."],
    residential: [1, "Local recovery clientele."],
  },
  derma: {
    luxury_retail: [2, "Cosmetic spend correlates with luxury."],
    hotel: [1, "Out-of-town treatments."],
    competitor: [0, "Derma competition is brand-driven."],
    residential: [1, "Repeat patients live nearby."],
  },
  vet: {
    residential: [2, "Pet owners prefer walk-able vets."],
    park: [2, "Dog parks signal pet density."],
    competitor: [-1, "Catchment radius is small."],
  },
  // ── Retail
  fashion: {
    luxury_retail: [2, "Cluster effect: shoppers visit multiple stores."],
    cafe: [1, "Browse + coffee is a routine."],
    transit: [1, "Foot traffic helps discovery."],
    competitor: [1, "Retail clusters often help, not hurt."],
    fast_food: [-1, "Wrong adjacency for fashion."],
  },
  books: {
    cafe: [2, "Books + coffee is the cliché for a reason."],
    school: [2, "Students are a built-in market."],
    luxury_retail: [1, "Cultural shoppers buy books."],
    competitor: [-1, "Indie bookstores struggle to coexist."],
  },
  grocery: {
    residential: [2, "Catchment-driven category."],
    transit: [1, "Commuter pickups."],
    competitor: [-1, "Supermarkets nearby crush specialty."],
  },
  electronics: {
    office_tower: [1, "B2B walk-ins for accessories."],
    school: [1, "Student tech buyers."],
    competitor: [-2, "Big-box electronics compress margins."],
    transit: [1, "Convenience purchases."],
  },
  // ── Coworking
  open_desk: {
    cafe: [2, "Cafés signal a freelance-friendly area."],
    office_tower: [1, "Overflow from corporate teams."],
    transit: [2, "Members commute in."],
    competitor: [-2, "Coworking is winner-take-most locally."],
    residential: [1, "Work-from-near-home demand."],
  },
  private_office: {
    office_tower: [2, "Spillover demand from corporate leases."],
    transit: [2, "Executive convenience."],
    luxury_retail: [1, "Premium positioning aligns."],
    competitor: [-1, "Differentiation matters."],
  },
  creative: {
    luxury_retail: [1, "Creative agencies cluster near luxury."],
    cafe: [2, "Designers live in cafés."],
    residential: [1, "Walk-to-studio appeal."],
    competitor: [-1, "Creative studios are sticky to brand."],
  },
};

/**
 * Compute the matrix output for a given subtype + a list of detected neighbor signals.
 */
export function scoreNeighbors(
  subtypeId: string,
  neighborCounts: Record<string, number>
): NeighborSignal[] {
  const subtypeRules = { ...DEFAULT_RULES, ...(RULES[subtypeId] ?? {}) };
  return Object.entries(neighborCounts)
    .filter(([, count]) => count > 0)
    .map(([key, count]) => {
      const rule = subtypeRules[key];
      const [verdict, reason] = rule ?? [0, "Neutral signal for this category."];
      return {
        id: key,
        label: NEIGHBOR_LABEL[key] ?? key,
        count,
        verdict,
        reason,
      };
    })
    .sort((a, b) => b.verdict - a.verdict);
}

export function overallScore(signals: NeighborSignal[]): {
  score: number; // -100..+100
  grade: "A" | "B" | "C" | "D" | "F";
  verdict: Verdict;
} {
  if (signals.length === 0) return { score: 0, grade: "C", verdict: 0 };
  const total = signals.reduce((sum, s) => sum + s.verdict * Math.min(s.count, 8), 0);
  const max = signals.reduce((sum, s) => sum + 2 * Math.min(s.count, 8), 0);
  const score = Math.round((total / Math.max(max, 1)) * 100);
  const grade = score > 55 ? "A" : score > 25 ? "B" : score > 0 ? "C" : score > -30 ? "D" : "F";
  const verdict: Verdict = score > 50 ? 2 : score > 15 ? 1 : score > -15 ? 0 : score > -45 ? -1 : -2;
  return { score, grade, verdict };
}
