import { describe, expect, it } from "vitest";
import { formatNPR } from "./currency";

describe("formatNPR", () => {
  it("formats whole amounts with two decimals", () => {
    expect(formatNPR(500)).toBe("रू 500.00");
  });

  it("formats decimal amounts", () => {
    expect(formatNPR(1234.5)).toBe("रू 1,234.50");
  });

  it("formats zero", () => {
    expect(formatNPR(0)).toBe("रू 0.00");
  });

  it("formats negative amounts", () => {
    expect(formatNPR(-10.25)).toBe("रू -10.25");
  });
});