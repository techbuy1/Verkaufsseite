import { mkdir, readFile, unlink, writeFile } from "fs/promises";
import path from "path";

const DATA_DIR = path.join(process.cwd(), ".data");
const SEQUENCES_FILE = path.join(DATA_DIR, "sequences.json");

interface Sequences {
  order: number;
  invoice: number;
}

async function readSequences(): Promise<Sequences> {
  try {
    const raw = await readFile(SEQUENCES_FILE, "utf8");
    const parsed = JSON.parse(raw) as Partial<Sequences>;
    return {
      order: Number.isFinite(parsed.order) ? Number(parsed.order) : 0,
      invoice: Number.isFinite(parsed.invoice) ? Number(parsed.invoice) : 0,
    };
  } catch {
    return { order: 0, invoice: 0 };
  }
}

async function writeSequences(seq: Sequences): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(SEQUENCES_FILE, JSON.stringify(seq, null, 2), "utf8");
}

async function withSequenceLock<T>(fn: () => Promise<T>): Promise<T> {
  const lockPath = path.join(DATA_DIR, "sequences.lock");
  await mkdir(DATA_DIR, { recursive: true });

  for (let attempt = 0; attempt < 80; attempt += 1) {
    try {
      await writeFile(lockPath, `${process.pid}-${Date.now()}`, { flag: "wx" });
      try {
        return await fn();
      } finally {
        await unlink(lockPath).catch(() => undefined);
      }
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 25 + attempt * 5));
    }
  }

  throw new Error("Nummernvergabe ist vorübergehend nicht verfügbar.");
}

function formatYearNumber(prefix: string, year: number, value: number): string {
  return `${prefix}-${year}-${String(value).padStart(6, "0")}`;
}

/** Unique TechBuy order number, e.g. TB-2026-000001 */
export async function nextOrderNumber(): Promise<string> {
  const year = new Date().getFullYear();
  return withSequenceLock(async () => {
    const seq = await readSequences();
    seq.order += 1;
    await writeSequences(seq);
    return formatYearNumber("TB", year, seq.order);
  });
}

/** Unique invoice number, e.g. RE-2026-000001 */
export async function nextInvoiceNumber(): Promise<string> {
  const year = new Date().getFullYear();
  return withSequenceLock(async () => {
    const seq = await readSequences();
    seq.invoice += 1;
    await writeSequences(seq);
    return formatYearNumber("RE", year, seq.invoice);
  });
}
