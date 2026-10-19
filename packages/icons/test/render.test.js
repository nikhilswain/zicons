import { describe, it, expect } from "vitest";
import { resolveProps, pixelSize, safeId } from "../runtime/render.js";
import { toSvg, pencil, chevronDown } from "../dist/index.js";

describe("render", () => {
  it("defaults", () => {
    const r = resolveProps({});
    expect([r.width, r.height, r.stroke, r.strokeWidth, r.boil]).toEqual([24, 24, "currentColor", 1.6, null]);
    expect(r.a11y).toEqual({ "aria-hidden": "true" });
  });
  it("label makes role img", () => {
    expect(resolveProps({ "aria-label": "Edit" }).a11y).toEqual({ role: "img" });
  });
  it("absolute stroke", () => {
    expect(resolveProps({ size: 48, absoluteStrokeWidth: true }).strokeWidth).toBe(0.8);
    expect(resolveProps({ size: "2em", absoluteStrokeWidth: true }).strokeWidth).toBe(1.6);
  });
  it("strength from size", () => {
    expect(resolveProps({ size: 32, boil: true }).boil).toEqual({ strength: "big", hover: false });
    expect(resolveProps({ size: "2em", boil: "hover" }).boil).toEqual({ strength: "small", hover: true });
    expect(pixelSize("40px")).toBe(40);
  });
  it("safe ids", () => expect(safeId(":r1:")).toBe("zir1"));
});

describe("toSvg", () => {
  it("plain icon matches the svg file shape", () => {
    const s = toSvg(pencil);
    expect(s).toContain('viewBox="0 0 24 24"');
    expect(s).toContain('stroke-width="1.6"');
    expect(s).toContain('aria-hidden="true"');
    expect(s).not.toContain("<filter");
  });
  it("boil adds a filter with unique ids and no NaN", () => {
    const a = toSvg(chevronDown, { boil: true, size: "2em" });
    const b = toSvg(chevronDown, { boil: true });
    expect(a).toContain("<filter");
    expect(a).not.toContain("NaN");
    expect(a.match(/data-zi="([^"]+)"/)[1]).not.toBe(b.match(/data-zi="([^"]+)"/)[1]);
  });
  it("hover boil carries a scoped style", () => {
    expect(toSvg(pencil, { boil: "hover" })).toMatch(/<style>[^<]*\[data-zi="/);
  });
  it("hover boil reacts only to interactive parents, not any tabindex container", () => {
    const s = toSvg(pencil, { boil: "hover" });
    expect(s).not.toContain("[tabindex]");
    expect(s).toContain("a[href]");
  });
  it("toSvg ids never match the ids frameworks generate", () => {
    expect(toSvg(pencil, { boil: true }).match(/data-zi="([^"]+)"/)[1]).toMatch(/^zit\d+$/);
  });
});
