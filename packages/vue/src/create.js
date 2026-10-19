import { defineComponent, h, useId } from "vue";
import { DEFAULTS, boilMarkup, boilPathFilter, pixelSize, resolveProps, safeId } from "zicons/render";

const props = {
  size: { type: [Number, String], default: DEFAULTS.size },
  color: { type: String, default: DEFAULTS.color },
  strokeWidth: { type: [Number, String], default: DEFAULTS.strokeWidth },
  absoluteStrokeWidth: Boolean,
  boil: { type: [Boolean, String], default: false },
};

export function createIcon(d, name) {
  return defineComponent({
    name,
    props,
    setup(p, { attrs, slots }) {
      const raw = useId();
      return () => {
        const r = resolveProps({ ...p, ...attrs });
        const id = r.boil ? safeId(raw) : undefined;
        return h(
          "svg",
          {
            xmlns: "http://www.w3.org/2000/svg",
            width: r.width,
            height: r.height,
            viewBox: "0 0 24 24",
            fill: "none",
            stroke: r.stroke,
            "stroke-width": r.strokeWidth,
            "stroke-linecap": "round",
            "stroke-linejoin": "round",
            ...r.a11y,
            "data-zi": id,
          },
          [
            id ? h("defs", { innerHTML: boilMarkup(id, r.boil, pixelSize(r.width)) }) : null,
            h("path", { d, filter: id ? boilPathFilter(id, r.boil) : undefined }),
            slots.default?.(),
          ],
        );
      };
    },
  });
}
