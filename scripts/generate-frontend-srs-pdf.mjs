import puppeteer from "puppeteer";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const assetsDir = join(root, "docs", "pdf-assets");
const htmlPath = join(root, "docs", "frontend-srs-guide-3-pages.html");
const outPdf = join(root, "docs", "GridsGold-Frontend-SRS-Guide.pdf");

mkdirSync(assetsDir, { recursive: true });

const shots = [
  { url: "http://localhost:3000/", name: "landing" },
  { url: "http://localhost:3000/login", name: "login" },
];

const browser = await puppeteer.launch({
  headless: true,
  args: ["--no-sandbox", "--disable-setuid-sandbox"],
});

try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });

  for (const s of shots) {
    try {
      await page.goto(s.url, { waitUntil: "networkidle2", timeout: 15000 });
      await new Promise((r) => setTimeout(r, 1000));
      await page.screenshot({ path: join(assetsDir, `${s.name}.png`) });
    } catch {
      console.warn(`Skipped screenshot for ${s.url} (dev server may be offline)`);
    }
  }

  const pdfPage = await browser.newPage();
  await pdfPage.goto(`file://${htmlPath}`, { waitUntil: "networkidle0" });
  await pdfPage.pdf({
    path: outPdf,
    format: "A4",
    printBackground: true,
    margin: { top: "12mm", right: "11mm", bottom: "12mm", left: "11mm" },
  });

  console.log(`PDF written to ${outPdf}`);
} finally {
  await browser.close();
}
