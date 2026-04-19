export type BusinessCategory =
  | "restaurant"
  | "cafe"
  | "gym"
  | "clinic"
  | "retail"
  | "coworking";

export interface BusinessType {
  id: BusinessCategory;
  label: string;
  blurb: string;
  icon: string; // emoji as cartographic stamp
  subtypes: { id: string; label: string; tag: string }[];
}

export const BUSINESS_TYPES: BusinessType[] = [
  {
    id: "restaurant",
    label: "Restaurant",
    blurb: "Full service, fast casual, ethnic cuisines",
    icon: "◷",
    subtypes: [
      { id: "thai", label: "Thai", tag: "Asian / Spice-forward" },
      { id: "japanese", label: "Japanese", tag: "Asian / Premium" },
      { id: "italian", label: "Italian", tag: "European / Casual" },
      { id: "mexican", label: "Mexican", tag: "Latin / Casual" },
      { id: "vegan", label: "Vegan", tag: "Health-focused" },
      { id: "fast_casual", label: "Fast Casual", tag: "Quick-serve" },
      { id: "fast_food", label: "Fast Food", tag: "Quick-serve / Volume" },
      { id: "fine_dining", label: "Fine Dining", tag: "Premium / Destination" },
    ],
  },
  {
    id: "cafe",
    label: "Café",
    blurb: "Coffee, brunch, specialty drinks",
    icon: "◐",
    subtypes: [
      { id: "specialty_coffee", label: "Specialty Coffee", tag: "Third-wave" },
      { id: "brunch", label: "Brunch Spot", tag: "Weekend / Daytime" },
      { id: "boba", label: "Bubble Tea", tag: "Asian / Youth" },
      { id: "bakery", label: "Bakery Café", tag: "Grab-and-go" },
    ],
  },
  {
    id: "gym",
    label: "Gym / Fitness",
    blurb: "Studios, big-box, boutique",
    icon: "◇",
    subtypes: [
      { id: "boutique", label: "Boutique Studio", tag: "Pilates / Yoga / HIIT" },
      { id: "crossfit", label: "CrossFit Box", tag: "Functional" },
      { id: "bigbox", label: "Big Box Gym", tag: "24/7 / Volume" },
      { id: "martial", label: "Martial Arts", tag: "Discipline" },
    ],
  },
  {
    id: "clinic",
    label: "Clinic",
    blurb: "Medical, dental, wellness",
    icon: "◉",
    subtypes: [
      { id: "dental", label: "Dental", tag: "Healthcare" },
      { id: "physio", label: "Physiotherapy", tag: "Wellness" },
      { id: "derma", label: "Dermatology", tag: "Premium / Aesthetic" },
      { id: "vet", label: "Veterinary", tag: "Pet care" },
    ],
  },
  {
    id: "retail",
    label: "Retail",
    blurb: "Boutique, specialty, lifestyle",
    icon: "◈",
    subtypes: [
      { id: "fashion", label: "Fashion Boutique", tag: "Apparel" },
      { id: "books", label: "Bookstore", tag: "Specialty" },
      { id: "grocery", label: "Specialty Grocery", tag: "Food retail" },
      { id: "electronics", label: "Electronics", tag: "Tech" },
      { id: "beauty", label: "Beauty & Cosmetics", tag: "Personal care" },
      { id: "homeware", label: "Home & Living", tag: "Lifestyle" },
      { id: "toys", label: "Toys & Hobbies", tag: "Family / Kids" },
      { id: "sports", label: "Sports & Outdoor", tag: "Active lifestyle" },
      { id: "jewelry", label: "Jewelry & Accessories", tag: "Premium" },
      { id: "pet", label: "Pet Supplies", tag: "Pet care" },
      { id: "florist", label: "Florist", tag: "Gifting" },
      { id: "convenience", label: "Convenience Store", tag: "Daily needs" },
    ],
  },
  {
    id: "coworking",
    label: "Co-working",
    blurb: "Shared workspace, private offices",
    icon: "◰",
    subtypes: [
      { id: "open_desk", label: "Open Desk", tag: "Freelancer" },
      { id: "private_office", label: "Private Offices", tag: "Teams" },
      { id: "creative", label: "Creative Studio", tag: "Designers" },
    ],
  },
];

export const getType = (id: BusinessCategory) =>
  BUSINESS_TYPES.find((t) => t.id === id)!;
