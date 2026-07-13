import puppeteer from "puppeteer";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const assetsDir = join(root, "docs", "pdf-assets");
const outPdf = join(root, "docs", "GridsGold-Technical-Guide-3-Pages.pdf");

mkdirSync(assetsDir, { recursive: true });

const pages = [
  { url: "http://localhost:3000/", name: "landing", file: "app/page.tsx" },
  { url: "http://localhost:3000/login", name: "login", file: "app/login/page.tsx + AuthPanel.tsx" },
  { url: "http://localhost:3000/dashboard", name: "dashboard", file: "app/dashboard/page.tsx" },
];

const browser = await puppeteer.launch({
  headless: true,
  args: ["--no-sandbox", "--disable-setuid-sandbox"],
});

const shot = await browser.newPage();
await shot.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });

for (const p of pages) {
  await shot.goto(p.url, { waitUntil: "networkidle2", timeout: 60000 });
  await new Promise((r) => setTimeout(r, 1200));
  await shot.screenshot({
    path: join(assetsDir, `${p.name}.png`),
    fullPage: false,
  });
}

await shot.close();

const htmlPath = join(root, "docs", "technical-guide-3-pages.html");
const html = readFileSync(htmlPath, "utf8");
const pdfPage = await browser.newPage();
await pdfPage.goto(`file://${htmlPath}`, { waitUntil: "networkidle0" });
await pdfPage.pdf({
  path: outPdf,
  format: "A4",
  printBackground: true,
  margin: { top: "14mm", right: "12mm", bottom: "14mm", left: "12mm" },
});

await browser.close();
console.log(`PDF written to ${outPdf}`);
