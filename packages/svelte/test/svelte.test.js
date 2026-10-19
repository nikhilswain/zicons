import { describe, it, expect } from "vitest";
import { render } from "svelte/server";
import { PencilIcon } from "../dist/index.js";
import Two from "./Two.svelte";

const html = (C, props) => render(C, { props }).body;

describe("zicons-svelte", () => {
  it("renders the defaults", () => {
    const s = html(PencilIcon);
    expect(s).toContain('width="24"');
    expect(s).toContain('stroke-width="1.6"');
    expect(s).toContain('aria-hidden="true"');
    expect(s).not.toContain("<filter");
  });
  it("passes through the user's attributes and labels", () => {
    const s = html(PencilIcon, { "aria-label": "Edit", class: "x", id: "mine", size: 40 });
    expect(s).toContain('role="img"');
    expect(s).toContain('class="x"');
    expect(s).toContain('id="mine"');
    expect(s).toContain('width="40"');
    expect(s).not.toContain("aria-hidden");
  });
  it("gives each wobbling icon its own filter id", () => {
    const ids = [...html(Two).matchAll(/data-zi="([^"]+)"/g)].map((m) => m[1]);
    expect(ids).toHaveLength(2);
    expect(ids[0]).not.toBe(ids[1]);
  });
  it("hover wobble carries a style", () => {
    expect(html(PencilIcon, { boil: "hover" })).toContain("<style>");
  });
});
