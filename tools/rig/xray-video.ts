/**
 * A video of the nerve x-ray mock-up (xray.html?video), drawn frame by frame, so takes with
 * different settings match frame for frame: a turn round the whole body, then a swing across the
 * face. Writes PNG frames to <out dir>/f0000.png…; join them with ffmpeg.
 * Usage: bun tools/rig/xray-video.ts <page url> <out dir> [query, e.g. "&look=xray&label=x-ray"] [first frame] [last frame]
 */
import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";

const [url = "http://127.0.0.1:5581/xray.html", out = "out/xray-video", extra = "", from = "0", to = ""] = process.argv.slice(2);
const FPS = 30, BODY = 8, HEAD = 5;
const ease = (x: number) => (x < 0.5 ? 2 * x * x : 1 - (-2 * x + 2) ** 2 / 2);
/** the camera at frame i: where it looks (body or head), from what azimuth (degrees from the front), how far, how high */
const shot = (i: number): [number, string, number, number, number] => {
  const t = i / FPS;
  if (t < BODY) return [t, "body", 30 + 360 * ease(t / BODY), 360, 25];
  return [t, "head", 40 - 80 * ease((t - BODY) / HEAD), 95, 8];
};
const last = to ? Number(to) : (BODY + HEAD) * FPS - 1;

mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ headless: true, args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] });
const page = await browser.newPage({ viewport: { width: 640, height: 960 }, deviceScaleFactor: 1 });
page.on("pageerror", (e) => console.log(`pageerror: ${e.message}`));
await page.goto(`${url}?shot&video&look=function${extra}`, { waitUntil: "load" });
await page.waitForFunction(() => (window as unknown as { xrayReady?: boolean }).xrayReady, null, { timeout: 180_000 });
const t0 = performance.now();
for (let i = Number(from); i <= last; i++) {
  const s = shot(i);
  await page.evaluate((s) => (window as unknown as { xrayRender: (...a: unknown[]) => void }).xrayRender(...s), s);
  await page.screenshot({ path: `${out}/f${String(i).padStart(4, "0")}.png` });
  if (i % 30 === 0) console.log(`${out}: frame ${i} (${((performance.now() - t0) / 1000).toFixed(0)} s)`);
}
await browser.close();
