import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";

export interface WithdrawalRequestRecord {
  id: string;
  type: "withdrawal";
  name: string;
  orderNumber: string;
  email: string;
  reason?: string;
  confirmed: boolean;
  submittedAt: string;
}

const DATA_DIR = path.join(process.cwd(), ".data");
const REQUESTS_FILE = path.join(DATA_DIR, "withdrawal-requests.json");

function normalizeRecord(raw: unknown): WithdrawalRequestRecord | null {
  if (!raw || typeof raw !== "object") return null;
  const entry = raw as Partial<WithdrawalRequestRecord>;
  if (
    typeof entry.id !== "string" ||
    typeof entry.name !== "string" ||
    typeof entry.orderNumber !== "string" ||
    typeof entry.email !== "string" ||
    typeof entry.submittedAt !== "string"
  ) {
    return null;
  }
  return {
    id: entry.id,
    type: "withdrawal",
    name: entry.name.trim(),
    orderNumber: entry.orderNumber.trim(),
    email: entry.email.trim(),
    reason: typeof entry.reason === "string" ? entry.reason.trim() : undefined,
    confirmed: entry.confirmed === true,
    submittedAt: entry.submittedAt,
  };
}

export async function readWithdrawalRequests(): Promise<WithdrawalRequestRecord[]> {
  try {
    const raw = await readFile(REQUESTS_FILE, "utf8");
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map(normalizeRecord)
      .filter((entry): entry is WithdrawalRequestRecord => entry !== null);
  } catch {
    return [];
  }
}

export async function appendWithdrawalRequest(
  input: Omit<WithdrawalRequestRecord, "id" | "type" | "submittedAt">,
): Promise<WithdrawalRequestRecord> {
  const record: WithdrawalRequestRecord = {
    id: `WR-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type: "withdrawal",
    submittedAt: new Date().toISOString(),
    ...input,
  };

  const existing = await readWithdrawalRequests();
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(REQUESTS_FILE, JSON.stringify([record, ...existing], null, 2), "utf8");
  return record;
}

export { REQUESTS_FILE as WITHDRAWAL_REQUESTS_FILE };
