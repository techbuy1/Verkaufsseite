import { spawn } from "node:child_process";
import { writeFile } from "node:fs/promises";
import path from "node:path";
import puppeteer from "puppeteer-core";

const ROOT = path.resolve(import.meta.dirname, "../..");
const PORT = 8766;
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const models = process.argv.slice(2);

async function main() {
  const server = spawn("python3", ["-m", "http.server", String(PORT), "--bind", "127.0.0.1"], {
    cwd: ROOT,
    stdio: "ignore",
  });
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: "new",
    args: ["--hide-scrollbars"],
  });
  try {
    for (const model of models) {
      const page = await browser.newPage();
      const url = `http://127.0.0.1:${PORT}/scripts/glb-still/inspect.html?model=${encodeURIComponent(model)}`;
      await page.goto(url, { waitUntil: "networkidle0", timeout: 120000 });
      await page.waitForFunction(() => document.title === "READY" || document.title === "ERROR", {
        timeout: 90000,
      });
      const data = await page.evaluate(() => window.__INSPECT);
      const out = path.join(ROOT, "scripts/glb-still", `${path.basename(model, ".glb")}.inspect.json`);
      await writeFile(out, JSON.stringify(data, null, 2));
      console.log(model, data.meshCount ?? data.error, out);
      await page.close();
    }
  } finally {
    await browser.close();
    server.kill("SIGTERM");
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
