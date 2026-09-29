import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { Resvg } from "@resvg/resvg-js";

const ROOT = import.meta.dir;
const OUT_DIR = join(ROOT, "..", "dist", "icons");
const SIZES = [16, 32, 48, 128];

const logo = readFileSync(join(ROOT, "..", "public", "logo.svg"), "utf8");
const paths = [...logo.matchAll(/<path\b[^>]*>/g)].map((m) => m[0]).join("\n    ");

const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
  <rect x="0.5" y="0.5" width="23" height="23" rx="5.5" fill="#ffffff"/>
  <g transform="translate(12 12) scale(0.75) translate(-12 -12)">
    ${paths}
  </g>
</svg>`;

mkdirSync(OUT_DIR, { recursive: true });
for (const size of SIZES) {
  const resvg = new Resvg(iconSvg, { fitTo: { mode: "width", value: size } });
  writeFileSync(join(OUT_DIR, `${size}.png`), resvg.render().asPng());
}
console.log(`Generated icons in ${OUT_DIR}`);
