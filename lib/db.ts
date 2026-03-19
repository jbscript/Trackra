import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import path from "path";

declare global {
  var prisma: PrismaClient | undefined;
}

const dbFile = "file:" + path.join(process.cwd(), "db", "dev.db");
const adapter = new PrismaBetterSqlite3({ url: dbFile });

export const db = globalThis.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalThis.prisma = db;
