const range = (start: number, end: number): number[] =>
  Array.from({ length: end - start + 1 }, (_, i) => start + i);

/**
 * Page numbers to render, with "…" for gaps. Up to 7 pages shows them all;
 * beyond that it always keeps the first page, the last page, and a window of
 * `siblings` around the current page.
 */
export function paginationRange(
  current: number,
  total: number,
  siblings = 1,
): (number | "…")[] {
  const slots = siblings * 2 + 5;
  if (total <= slots) return range(1, total);

  const leftSibling = Math.max(current - siblings, 1);
  const rightSibling = Math.min(current + siblings, total);
  const showLeftDots = leftSibling > 2;
  const showRightDots = rightSibling < total - 1;
  const edgeCount = 3 + siblings * 2;

  if (!showLeftDots && showRightDots) {
    return [...range(1, edgeCount), "…", total];
  }
  if (showLeftDots && !showRightDots) {
    return [1, "…", ...range(total - edgeCount + 1, total)];
  }
  return [1, "…", ...range(leftSibling, rightSibling), "…", total];
}
