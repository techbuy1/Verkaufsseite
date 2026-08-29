import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import puppeteer from "puppeteer-core";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "../..");
const PORT = 8765;
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const JOBS = [
  {
    slug: "iphone-17-pro",
    color: "cosmic-orange",
    model: "/public/models/iphone-17-pro-cosmic-orange.glb",
    wallpaper: "/public/images/products/Apple/iPhone-17-Pro-wallpapers/cosmic-orange.png",
  },
  {
    slug: "iphone-17-pro",
    color: "deep-blue",
    model: "/public/models/iphone-17-pro-deep-blue-hq.glb",
    wallpaper: "/public/images/products/Apple/iPhone-17-Pro-wallpapers/deep-blue.png",
  },
  {
    slug: "iphone-17-pro",
    color: "silver",
    model: "/public/models/iphone-17-pro-silver.glb",
    wallpaper: "/public/images/products/Apple/iPhone-17-Pro-wallpapers/silver.png",
  },
  {
    slug: "iphone-17-pro-max",
    color: "cosmic-orange",
    model: "/public/models/iphone-17-pro-cosmic-orange.glb",
    wallpaper: "/public/images/products/Apple/iPhone-17-Pro-wallpapers/cosmic-orange.png",
  },
  {
    slug: "iphone-17-pro-max",
    color: "deep-blue",
    model: "/public/models/iphone-17-pro-deep-blue-hq.glb",
    wallpaper: "/public/images/products/Apple/iPhone-17-Pro-wallpapers/deep-blue.png",
  },
  {
    slug: "iphone-17-pro-max",
    color: "silver",
    model: "/public/models/iphone-17-pro-silver.glb",
    wallpaper: "/public/images/products/Apple/iPhone-17-Pro-wallpapers/silver.png",
  },
  {
    slug: "galaxy-s26-ultra",
    color: "sky-blue",
    model: "/public/models/galaxy-s26-ultra.glb",
    tint: "#7eb6d7",
    wallpaper: "/public/images/products/Samsung /Samsung Galaxy Handy /Samsung Galaxy S26 Serie /wallpapers/sky-blue.png",
  },
  {
    slug: "galaxy-s26-ultra",
    color: "pink",
    model: "/public/models/galaxy-s26-ultra.glb",
    tint: "#f4b4c4",
    wallpaper: "/public/images/products/Samsung /Samsung Galaxy Handy /Samsung Galaxy S26 Serie /wallpapers/pink.png",
  },
  {
    slug: "galaxy-s26-ultra",
    color: "silver",
    model: "/public/models/galaxy-s26-ultra.glb",
    tint: "#d2d2d7",
    wallpaper: "/public/images/products/Samsung /Samsung Galaxy Handy /Samsung Galaxy S26 Serie /wallpapers/silver.png",
  },
  {
    slug: "galaxy-s26-ultra",
    color: "violet",
    model: "/public/models/galaxy-s26-ultra.glb",
    tint: "#8b7ab8",
    wallpaper: "/public/images/products/Samsung /Samsung Galaxy Handy /Samsung Galaxy S26 Serie /wallpapers/violet.png",
  },
  {
    slug: "galaxy-s26-ultra",
    color: "white",
    model: "/public/models/galaxy-s26-ultra.glb",
    tint: "#f5f5f7",
    wallpaper: "/public/images/products/Samsung /Samsung Galaxy Handy /Samsung Galaxy S26 Serie /wallpapers/white.png",
  },
  {
    slug: "galaxy-s26-ultra",
    color: "black",
    model: "/public/models/galaxy-s26-ultra.glb",
    tint: "#1d1d1f",
    wallpaper: "/public/images/products/Samsung /Samsung Galaxy Handy /Samsung Galaxy S26 Serie /wallpapers/black.png",
  },
];

function stillUrl(job, view) {
  const query = new URLSearchParams({
    model: job.model,
    view,
    w: "1200",
    h: "1600",
  });
  if (job.tint) query.set("tint", job.tint);
  if (job.wallpaper) query.set("wallpaper", job.wallpaper);
  return `http://127.0.0.1:${PORT}/scripts/glb-still/index.html?${query}`;
}

async function renderView(page, job, view) {
  await page.goto(stillUrl(job, view), { waitUntil: "networkidle0", timeout: 120000 });
  await page.waitForFunction(() => window.__STILL_READY === true || window.__STILL_ERROR, {
    timeout: 90000,
  });
  const result = await page.evaluate(() => ({
    ready: window.__STILL_READY,
    error: window.__STILL_ERROR,
    dataUrl: window.__STILL_DATA_URL,
  }));
  if (!result.ready || !result.dataUrl) {
    throw new Error(`${job.slug}/${job.color}/${view}: ${result.error || "render failed"}`);
  }
  const buffer = Buffer.from(result.dataUrl.split(",")[1], "base64");
  const outDir = path.join(ROOT, "public/images/products", job.slug, job.color);
  await mkdir(outDir, { recursive: true });
  const outPath = path.join(outDir, `${view}.webp`);
  await sharp(buffer).webp({ quality: 86, effort: 4 }).toFile(outPath);
  return path.relative(ROOT, outPath);
}

async function main() {
  const server = spawn("python3", ["-m", "http.server", String(PORT), "--bind", "127.0.0.1"], {
    cwd: ROOT,
    stdio: "ignore",
  });
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: "new",
    args: ["--disable-gpu-sandbox", "--hide-scrollbars"],
  });
  const page = await browser.newPage();
  page.setDefaultTimeout(120000);
  const written = [];
  try {
    for (const job of JOBS) {
      written.push(await renderView(page, job, "front"));
      written.push(await renderView(page, job, "back"));
      console.log(`rendered ${job.slug}/${job.color}`);
    }
  } finally {
    await browser.close();
    server.kill("SIGTERM");
  }
  console.log(JSON.stringify({ count: written.length, files: written }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
