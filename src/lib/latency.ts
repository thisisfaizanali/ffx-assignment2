/**
 * Artificial delay on API responses so loading, skeleton, and error states are
 * actually visible while clicking through the app. This is deliberate scope
 * simulation — a real backend would have real latency — not accidental slowness.
 *
 * Full jitter in development; a flat ~80ms in production so the deployed demo
 * still shows its loading states without feeling sluggish.
 */
export function latency(): Promise<void> {
  const ms =
    process.env.NODE_ENV === "production" ? 80 : 180 + Math.random() * 240;
  return new Promise((resolve) => setTimeout(resolve, ms));
}
