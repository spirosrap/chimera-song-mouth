/**
 * Screenshots of the nerve x-ray mock-up (xray.html) for each look and view.
 * Usage: bun tools/xray-shots.ts <base url> <out dir> [look,look] [view,view] [extra query]
 */
import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";

const base = process.argv[2] ?? "http://127.0.0.1:5581/xray.html";
const out = process.argv[3] ?? "out/xray";
const looks = (process.argv[4] ?? "function,xray,signal").split(",");
const views = (process.argv[5] ?? "body,head").split(",");
const extra = process.argv[6] ?? "";
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ headless: true, args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] });
for (const view of views) {
  const portrait = view === "body" || view === "front" || view === "back";
  const page = await browser.newPage({ viewport: portrait ? { width: 900, height: 1300 } : { width: 1100, height: 1000 }, deviceScaleFactor: 1 });
  page.on("console", (m) => console.log(`[${view}] ${m.type()}: ${m.text()}`));
  page.on("pageerror", (e) => console.log(`[${view}] pageerror: ${e.message}`));
  for (const look of looks) {
    await page.goto(`${base}?shot&look=${look}&view=${view}&t=1.3${extra}`, { waitUntil: "load" });
    await page.waitForFunction(() => (window as unknown as { xrayReady?: boolean }).xrayReady, null, { timeout: 180_000 });
    await page.screenshot({ path: `${out}/${look}-${view}.png` });
    console.log(`${out}/${look}-${view}.png`);
  }
  await page.close();
}
await browser.close();
