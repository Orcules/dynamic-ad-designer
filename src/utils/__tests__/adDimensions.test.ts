import { describe, it, expect } from "vitest";
import { getDimensions } from "../adDimensions";

describe("getDimensions", () => {
  it("returns Facebook dimensions", () => {
    expect(getDimensions("facebook")).toEqual({ width: 1200, height: 628 });
  });

  it("returns square dimensions for Instagram", () => {
    expect(getDimensions("instagram")).toEqual({ width: 1080, height: 1080 });
  });

  it("returns portrait dimensions for Instagram story", () => {
    expect(getDimensions("instagram-story")).toEqual({ width: 1080, height: 1350 });
  });

  it("returns LinkedIn dimensions", () => {
    expect(getDimensions("linkedin")).toEqual({ width: 1200, height: 627 });
  });

  it("returns Twitter dimensions", () => {
    expect(getDimensions("twitter")).toEqual({ width: 1600, height: 900 });
  });

  it("falls back to default dimensions for unknown platforms", () => {
    expect(getDimensions("unknown-platform")).toEqual({ width: 1200, height: 628 });
    expect(getDimensions("")).toEqual({ width: 1200, height: 628 });
  });
});
