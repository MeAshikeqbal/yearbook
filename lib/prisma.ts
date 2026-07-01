import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

let prisma: PrismaClient;

// Helper to extract connection string from Cloudflare Hyperdrive binding or process.env
function getConnectionString(): string {
  // 1. Try process.env.DATABASE_URL (Local Development)
  let connectionString = process.env.DATABASE_URL;

  // 2. Try process.env.HYPERDRIVE (Cloudflare Pages/Workers environment variable)
  if (process.env.HYPERDRIVE) {
    try {
      const hd = typeof process.env.HYPERDRIVE === 'string'
        ? JSON.parse(process.env.HYPERDRIVE)
        : process.env.HYPERDRIVE;
      if (hd?.connectionString) {
        connectionString = hd.connectionString;
      }
    } catch (_) {}
  }

  // 3. Try Next-on-Pages request context (Cloudflare runtime binding)
  try {
    // Bypasses Next.js static bundler analysis for cloud-only modules
    const runRequire = eval("require");
    const { getRequestContext } = runRequire("@cloudflare/next-on-pages");
    const ctx = getRequestContext();
    if (ctx?.env?.HYPERDRIVE?.connectionString) {
      connectionString = ctx.env.HYPERDRIVE.connectionString;
    }
  } catch (_) {}

  if (!connectionString) {
    throw new Error("No database connection string found. Please set DATABASE_URL or configure HYPERDRIVE.");
  }

  return connectionString;
}

if (process.env.NODE_ENV === "production") {
  const connectionString = getConnectionString();
  const cleanConnectionString = connectionString
    .replace("&sslrootcert=system", "")
    .replace("?sslrootcert=system", "");
  
  const pool = new Pool({
    connectionString: cleanConnectionString,
    ssl: connectionString.includes("sslmode=") || connectionString.includes("sslrootcert=")
      ? { rejectUnauthorized: false }
      : undefined
  });
  const adapter = new PrismaPg(pool);
  prisma = new PrismaClient({ adapter });
} else {
  // In development, use a global variable to prevent hot-reloading from exhausting connections
  const globalForPrisma = global as unknown as { prisma: PrismaClient };
  if (!globalForPrisma.prisma) {
    const connectionString = getConnectionString();
    const cleanConnectionString = connectionString
      .replace("&sslrootcert=system", "")
      .replace("?sslrootcert=system", "");

    const pool = new Pool({
      connectionString: cleanConnectionString,
      ssl: connectionString.includes("sslmode=") || connectionString.includes("sslrootcert=")
        ? { rejectUnauthorized: false }
        : undefined
    });
    const adapter = new PrismaPg(pool);
    globalForPrisma.prisma = new PrismaClient({ adapter });
  }
  prisma = globalForPrisma.prisma;
}

export { prisma };
export default prisma;
