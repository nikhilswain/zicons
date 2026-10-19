export interface IconData {
  name: string;
  d: string;
}

export type Boil = boolean | "hover";

export interface ZiconProps {
  size?: number | string;
  color?: string;
  strokeWidth?: number | string;
  absoluteStrokeWidth?: boolean;
  boil?: Boil;
}

export interface ToSvgOptions extends ZiconProps {
  id?: string;
  attrs?: Record<string, string | number>;
  "aria-label"?: string;
  "aria-labelledby"?: string;
}

export interface BoilState {
  strength: "big" | "small";
  hover: boolean;
}

export interface Resolved {
  width: number | string;
  height: number | string;
  stroke: string;
  strokeWidth: number;
  a11y: { "aria-hidden": "true" } | { role: "img" };
  boil: BoilState | null;
}

export declare const SEEDS: number[];
export declare const BOIL_RATE: number;
export declare const BOIL: { big: { freq: number; scale: number }; small: { freq: number; scale: number } };
export declare const BIG_FROM: number;
export declare const DEFAULTS: { size: number; color: string; strokeWidth: number };

export declare function numericSize(size: unknown): number | null;
export declare function pixelSize(size: unknown): number;
export declare function boilMode(boil: unknown): "always" | "hover" | null;
export declare function resolveProps(props?: ZiconProps & { "aria-label"?: string; "aria-labelledby"?: string }): Resolved;
export declare function safeId(raw: string): string;
export declare function boilMarkup(id: string, boil: BoilState, px: number): string;
export declare function boilPathFilter(id: string, boil: BoilState | null): string | undefined;
export declare function toSvg(icon: IconData, options?: ToSvgOptions): string;
