import { createElement, forwardRef, useId } from "react";
import { boilMarkup, boilPathFilter, pixelSize, resolveProps, safeId } from "zicons/render";

export function createIcon(d, displayName) {
  const Icon = forwardRef(function Icon(props, ref) {
    const { size, color, strokeWidth, absoluteStrokeWidth, boil, children, ...rest } = props;
    const r = resolveProps(props);
    const raw = useId();
    const id = r.boil ? safeId(raw) : undefined;
    return createElement(
      "svg",
      {
        xmlns: "http://www.w3.org/2000/svg",
        width: r.width,
        height: r.height,
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: r.stroke,
        strokeWidth: r.strokeWidth,
        strokeLinecap: "round",
        strokeLinejoin: "round",
        ...r.a11y,
        ...rest,
        "data-zi": id,
        ref,
      },
      id && createElement("defs", { dangerouslySetInnerHTML: { __html: boilMarkup(id, r.boil, pixelSize(r.width)) } }),
      createElement("path", { d, filter: id ? boilPathFilter(id, r.boil) : undefined }),
      children,
    );
  });
  Icon.displayName = displayName;
  return Icon;
}
