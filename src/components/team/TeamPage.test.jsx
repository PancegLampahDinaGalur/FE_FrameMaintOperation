import { describe, expect, it } from "vitest";
import { getMonthRange } from "./TeamPage";

describe("getMonthRange", () => {
  it("returns inclusive month bounds in local calendar dates", () => {
    expect(getMonthRange(new Date(2026, 10, 13))).toEqual({
      from: "2026-11-01",
      to: "2026-11-30",
    });
  });

  it("handles leap-year February", () => {
    expect(getMonthRange(new Date(2024, 1, 20))).toEqual({
      from: "2024-02-01",
      to: "2024-02-29",
    });
  });
});
