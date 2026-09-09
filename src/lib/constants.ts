export const TAX_RATE = 0.08;
export const CURRENCY = "USD";
export const LOCALE = "en-US";

/**
 * Reference "today", anchored to the real current date at module load and
 * normalised to a date-only `YYYY-MM-DD` string. Seeded data and any overdue /
 * due-soon math key off this, so the date window slides forward with real time
 * while `mulberry32(42)` keeps the dataset shape identical run to run.
 */
export const TODAY = new Date().toISOString().slice(0, 10);

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
