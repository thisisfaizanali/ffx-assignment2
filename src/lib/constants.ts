export const TAX_RATE = 0.18;
export const CURRENCY = "INR";
export const LOCALE = "en-IN";

/** Shown on every totals block, in the app and on the printable invoice. */
export const TAX_LABEL = `GST (${Math.round(TAX_RATE * 100)}%)`;

/**
 * Reference "today", anchored to the real current date at module load and
 * normalised to a date-only `YYYY-MM-DD` string. Seeded data and any overdue /
 * due-soon math key off this, so the date window slides forward with real time
 * while `mulberry32(42)` keeps the dataset shape identical run to run.
 */
export const TODAY = new Date().toISOString().slice(0, 10);

/** Known clients, offered as datalist suggestions on the invoice form. */
export const COMPANIES = [
  "Shakti Roadways Pvt Ltd",
  "Deccan Warehousing Solutions",
  "Konkan Cargo Movers",
  "Sundaram Steel & Alloys",
  "Rajdhani Freight Carriers",
  "Godavari Agro Exports",
  "Trimurti Packaging Industries",
  "Bharat Auto Components",
  "Aravalli Mining Corporation",
  "Coromandel Shipping Lines",
  "Meenakshi Cement Works",
  "Neelkanth Polymers",
  "Kaveri Foods & Beverages",
  "Indus Valley Ceramics",
  "Surya Electricals Pvt Ltd",
  "Ashwin Textile Mills",
  "Nova Bharat Chemicals",
  "Vaayu Logistics Pvt Ltd",
] as const;
