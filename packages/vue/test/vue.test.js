import { describe, it, expect } from "vitest";
import { createSSRApp, h } from "vue";
import { renderToString } from "vue/server-renderer";
import { PencilIcon } from "../dist/index.js";

const html = (...nodes) => renderToString(createSSRApp({ render: () => nodes.map((n) => n()) }));

describe("zicons-vue", () => {
  it("renders the defaults", async () => {
    const s = await html(() => h(PencilIcon));
    expect(s).toContain('width="24"');
    expect(s).toContain('stroke-width="1.6"');
    expect(s).toContain('aria-hidden="true"');
    expect(s).not.toContain("<filter");
  });
  it("passes through the user's attributes and labels", async () => {
    const s = await html(() => h(PencilIcon, { "aria-label": "Edit", class: "x", id: "mine", size: 40 }));
    expect(s).toContain('role="img"');
    expect(s).toContain('class="x"');
    expect(s).toContain('id="mine"');
    expect(s).toContain('width="40"');
    expect(s).not.toContain("aria-hidden");
  });
  it("gives each wobbling icon its own filter id, and a bare boil counts", async () => {
    const s = await html(() => h(PencilIcon, { boil: "" }), () => h(PencilIcon, { boil: true }));
    const ids = [...s.matchAll(/data-zi="([^"]+)"/g)].map((m) => m[1]);
    expect(ids).toHaveLength(2);
    expect(ids[0]).not.toBe(ids[1]);
  });
  it("hover wobble carries a style", async () => {
    expect(await html(() => h(PencilIcon, { boil: "hover" }))).toContain("<style>");
  });
});
