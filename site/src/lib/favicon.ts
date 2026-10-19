import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { Resvg } from "@resvg/resvg-js";

const svg = () => readFileSync(resolve("public/favicon.svg"), "utf8");

export const faviconPng = (size: number, square = false) =>
  new Resvg(square ? svg().replace('rx="6"', 'rx="0"') : svg(), { fitTo: { mode: "width", value: size } }).render().asPng();

export function faviconIco(sizes: number[]): Buffer {
  const pngs = sizes.map((s) => faviconPng(s));
  const head = Buffer.alloc(6 + 16 * pngs.length);
  head.writeUInt16LE(0, 0);
  head.writeUInt16LE(1, 2);
  head.writeUInt16LE(pngs.length, 4);
  let offset = head.length;
  pngs.forEach((png, k) => {
    const o = 6 + 16 * k;
    head.writeUInt8(sizes[k] % 256, o);
    head.writeUInt8(sizes[k] % 256, o + 1);
    head.writeUInt16LE(1, o + 4);
    head.writeUInt16LE(32, o + 6);
    head.writeUInt32LE(png.length, o + 8);
    head.writeUInt32LE(offset, o + 12);
    offset += png.length;
  });
  return Buffer.concat([head, ...pngs]);
}
