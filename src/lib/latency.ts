/**
 * Artificial delay on API responses (180–420ms) so loading, skeleton, and error
 * states are actually visible while clicking through the app.
 */
export function latency(): Promise<void> {
  const ms = 180 + Math.random() * 240;
  return new Promise((resolve) => setTimeout(resolve, ms));
}
