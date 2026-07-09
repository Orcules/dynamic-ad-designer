import { describe, it, expect } from "vitest";
import { cleanImageUrl, adjustPositionForScale } from "../imageEffects";

describe("cleanImageUrl", () => {
  it("returns the URL unchanged when there is no metadata fragment", () => {
    expect(cleanImageUrl("https://example.com/image.png")).toBe(
      "https://example.com/image.png"
    );
  });

  it("strips a #metadata= fragment", () => {
    expect(cleanImageUrl("https://example.com/image.png#metadata=abc123")).toBe(
      "https://example.com/image.png"
    );
  });

  it("returns falsy input as-is", () => {
    expect(cleanImageUrl("")).toBe("");
  });
});

describe("adjustPositionForScale", () => {
  it("returns the same position for scale factor 1", () => {
    const position = { x: 10, y: 20 };
    expect(adjustPositionForScale(position, 1)).toBe(position);
  });

  it("scales x and y by the scale factor", () => {
    expect(adjustPositionForScale({ x: 10, y: 20 }, 2)).toEqual({ x: 20, y: 40 });
  });

  it("defaults to a scale factor of 1", () => {
    const position = { x: 5, y: 7 };
    expect(adjustPositionForScale(position)).toBe(position);
  });
});
