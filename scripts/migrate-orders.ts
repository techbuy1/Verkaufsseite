import { readFile } from "fs/promises";
import path from "path";
import { neon } from "@neondatabase/serverless";

function resolveDatabaseUrl(): string {
  const pooled = process.env.DATABASE_URL?.trim();
  const unpooled = process.env.DATABASE_URL_UNPOOLED?.trim();
  const url = unpooled || pooled;
  if (!url) {
    throw new Error("DATABASE_URL is missing");
  }
  return url;
}

function splitSqlStatements(sql: string): string[] {
  return sql
    .split(/;\s*\n/)
    .map((part) =>
      part
        .split("\n")
        .filter((line) => !line.trim().startsWith("--"))
        .join("\n")
        .trim()
        .replace(/;$/, ""),
    )
    .filter(Boolean);
}

async function main() {
  const sqlPath = path.join(process.cwd(), "scripts/sql/orders.sql");
  const source = await readFile(sqlPath, "utf8");
  const statements = splitSqlStatements(source);
  const sql = neon(resolveDatabaseUrl());

  for (const statement of statements) {
    await sql.query(statement, []);
  }

  console.log(`orders schema ready (${statements.length} statements)`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "migration failed");
  process.exit(1);
});
