import type { Component, Snippet } from "svelte";
import type { SVGAttributes } from "svelte/elements";
import type { ZiconProps as BaseProps } from "zicons/render";

export interface ZiconProps extends BaseProps, Omit<SVGAttributes<SVGSVGElement>, keyof BaseProps | "children"> {
  children?: Snippet;
}

export type ZiconComponent = Component<ZiconProps>;
