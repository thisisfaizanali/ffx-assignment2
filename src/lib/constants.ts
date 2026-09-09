export const TAX_RATE = 0.08;
export const CURRENCY = "USD";
export const LOCALE = "en-US";

/**
 * Fixed reference date. Seeded data and any "overdue" / "due soon" math key off
 * this so screenshots and tests stay stable regardless of the wall clock.
 */
export const TODAY = "2026-09-09";

/** Known clients, offered as datalist suggestions on the invoice form. */
export const COMPANIES = [
  "Meridian Freight Co.",
  "Alderwood Supply Group",
  "Bluefin Logistics",
  "Northgate Materials",
  "Solace Interiors",
  "Vantage Point Consulting",
  "Cascade Robotics",
  "Harborline Shipping",
  "Ferrous & Oak Metalworks",
  "Willowmere Studios",
  "Crestview Analytics",
  "Pinegate Construction",
  "Amberlight Media",
  "Redstone Industrial",
  "Silvercrest Foods",
  "Thistledown Apparel",
  "Ironbridge Systems",
  "Coppertone Realty",
] as const;
