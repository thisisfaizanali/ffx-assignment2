import { describe, expect, it } from "vitest";
import { COMPANIES, TODAY } from "@/lib/constants";
import { addDays } from "@/lib/format";
import { filterSort, query } from "@/server/store";

const base = { sort: "issueDate", dir: "desc" } as const;

describe("store filterSort", () => {
  it("returns the full seeded set with no filters", () => {
    expect(filterSort(base)).toHaveLength(1000);
  });

  it("defaults to issue date descending", () => {
    const rows = filterSort(base);
    for (let i = 1; i < rows.length; i++) {
      expect(rows[i - 1].issueDate >= rows[i].issueDate).toBe(true);
    }
  });

  it("filters by status", () => {
    const rows = filterSort({ ...base, status: ["overdue"] });
    expect(rows.length).toBeGreaterThan(0);
    expect(rows.every((r) => r.status === "overdue")).toBe(true);
  });

  it("searches number and client, case-insensitively", () => {
    const term = COMPANIES[0].split(" ")[0].toLowerCase();
    const rows = filterSort({ ...base, search: term });
    expect(rows.length).toBeGreaterThan(0);
    expect(
      rows.every(
        (r) =>
          r.client.toLowerCase().includes(term) ||
          r.number.toLowerCase().includes(term),
      ),
    ).toBe(true);
  });

  it("filters by issue date, inclusive, relative to TODAY", () => {
    expect(filterSort({ ...base, to: TODAY }).every((r) => r.issueDate <= TODAY))
      .toBe(true);

    const from = addDays(TODAY, -30);
    const recent = filterSort({ ...base, from });
    expect(recent.every((r) => r.issueDate >= from)).toBe(true);
    expect(recent.length).toBeGreaterThan(0);
    expect(recent.length).toBeLessThan(1000);
  });

  it("intersects combined filters", () => {
    const combined = filterSort({
      ...base,
      status: ["pending"],
      search: "cascade",
    });
    expect(
      combined.every(
        (r) =>
          r.status === "pending" &&
          r.client.toLowerCase().includes("cascade"),
      ),
    ).toBe(true);
    const pendingOnly = filterSort({ ...base, status: ["pending"] });
    expect(combined.length).toBeLessThanOrEqual(pendingOnly.length);
  });

  it("sorts by amount in both directions", () => {
    const asc = filterSort({ ...base, sort: "amount", dir: "asc" });
    const desc = filterSort({ ...base, sort: "amount", dir: "desc" });
    expect(asc[0].amount).toBeLessThanOrEqual(asc.at(-1)!.amount);
    expect(asc[0].amount).toBe(desc.at(-1)!.amount);
  });
});

describe("store query pagination", () => {
  it("slices the requested page and reports totals", () => {
    const p1 = query({ ...base, page: 1, pageSize: 25 });
    expect(p1.data).toHaveLength(25);
    expect(p1.total).toBe(1000);
    expect(p1.totalPages).toBe(40);

    const full = filterSort(base);
    const p2 = query({ ...base, page: 2, pageSize: 25 });
    expect(p2.data[0].id).toBe(full[25].id);
  });

  it("clamps an out-of-range page to the last page", () => {
    const res = query({ ...base, page: 999, pageSize: 25 });
    expect(res.page).toBe(40);
    expect(res.data).toHaveLength(25);
  });

  it("reflects the active filter in total and totalPages", () => {
    const res = query({ ...base, status: ["draft"], page: 1, pageSize: 10 });
    const draftCount = filterSort({ ...base, status: ["draft"] }).length;
    expect(res.total).toBe(draftCount);
    expect(res.totalPages).toBe(Math.ceil(draftCount / 10));
  });
});
