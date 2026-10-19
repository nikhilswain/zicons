import type { ForwardRefExoticComponent, RefAttributes, SVGProps } from "react";
import type { ZiconProps as BaseProps } from "zicons/render";

export interface ZiconProps extends BaseProps, Omit<SVGProps<SVGSVGElement>, keyof BaseProps | "ref"> {}

export type ZiconComponent = ForwardRefExoticComponent<ZiconProps & RefAttributes<SVGSVGElement>>;
