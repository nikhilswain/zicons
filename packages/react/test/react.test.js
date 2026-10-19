import { describe, it, expect } from "vitest";
import { createElement, Fragment } from "react";
import { renderToString } from "react-dom/server";
import { PencilIcon } from "../dist/index.js";

const html = (...nodes) => renderToString(createElement(Fragment, null, ...nodes));

describe("zicons-react", () => {
  it("renders the defaults", () => {
    const s = html(createElement(PencilIcon));
    expect(s).toContain('width="24"');
    expect(s).toContain('stroke-width="1.6"');
    expect(s).toContain('aria-hidden="true"');
    expect(s).not.toContain("<filter");
  });
  it("passes through the user's attributes and labels", () => {
    const s = html(createElement(PencilIcon, { "aria-label": "Edit", className: "x", id: "mine", style: { color: "red" }, size: 40 }));
    expect(s).toContain('role="img"');
    expect(s).toContain('class="x"');
    expect(s).toContain('id="mine"');
    expect(s).toContain('width="40"');
    expect(s).not.toContain("aria-hidden");
  });
  it("gives each wobbling icon its own filter id", () => {
    const s = html(createElement(PencilIcon, { boil: true }), createElement(PencilIcon, { boil: true }));
    const ids = [...s.matchAll(/data-zi="([^"]+)"/g)].map((m) => m[1]);
    expect(ids).toHaveLength(2);
    expect(ids[0]).not.toBe(ids[1]);
  });
  it("hover wobble carries a style", () => {
    expect(html(createElement(PencilIcon, { boil: "hover" }))).toContain("<style>");
  });
});
