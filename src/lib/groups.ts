/** Beneficiary group metadata used across navigation and landing pages. */
export type Group = {
  slug: string;
  name: string;
  blurb: string;
  emoji: string;
  phase1: boolean; // part of the MVP pilot scope
};

export const GROUPS: Group[] = [
  {
    slug: "senior_citizens",
    name: "Senior Citizens",
    blurb: "Old-age homes, dementia care, assisted living, day-care.",
    emoji: "🧓",
    phase1: true,
  },
  {
    slug: "widows",
    name: "Widows",
    blurb: "Residential support, pensions, and widow-support NGOs.",
    emoji: "🤍",
    phase1: true,
  },
  {
    slug: "children",
    name: "Children",
    blurb: "Children's homes, adoption agencies, shelters, protection services.",
    emoji: "🧒",
    phase1: true,
  },
  {
    slug: "women",
    name: "Women",
    blurb: "Shelters, support services, and welfare schemes.",
    emoji: "👩",
    phase1: false,
  },
  {
    slug: "students",
    name: "Students / Scholarships",
    blurb: "Government scholarships — pre-matric, post-matric, merit and category-based.",
    emoji: "🎓",
    phase1: false,
  },
  {
    slug: "mental_health",
    name: "Mental Health",
    blurb: "Psychiatric care, rehabilitation homes, and halfway homes.",
    emoji: "🧠",
    phase1: false,
  },
  {
    slug: "disability",
    name: "Disability",
    blurb: "Rehabilitation centres, special schools, assistive devices.",
    emoji: "♿",
    phase1: false,
  },
  {
    slug: "homeless",
    name: "Homeless / Destitute",
    blurb: "Shelters and rehabilitation services.",
    emoji: "🏠",
    phase1: false,
  },
  {
    slug: "ngos",
    name: "NGOs / Caregivers",
    blurb: "Charitable organizations and caregiver support.",
    emoji: "🤝",
    phase1: false,
  },
];

export const groupBySlug = (slug: string) => GROUPS.find((g) => g.slug === slug);
