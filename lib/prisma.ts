import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { cache } from "react";

/**
 * Returns a request-scoped PrismaClient.
 *
 * On Cloudflare Workers, global singleton connections cause I/O-out-of-bounds
 * errors because each Worker isolate is stateless. We use React.cache() to
 * create exactly one client per incoming request and reuse it across all
 * server components and route handlers within that same request.
 *
 * In production (Cloudflare Workers):
 *   - Reads the HYPERDRIVE binding via getCloudflareContext() for pooled,
 *     low-latency Postgres connections.
 *
 * In development (Node.js):
 *   - Falls back to process.env.DATABASE_URL from .env.local / .dev.vars.
 */
export const getPrismaClient = cache(async (): Promise<PrismaClient> => {
  let connectionString: string | undefined;

  // ── Production: Cloudflare Workers + Hyperdrive ────────────────────────────
  if (process.env.NODE_ENV === "production") {
    try {
      const { getCloudflareContext } = await import("@opennextjs/cloudflare");
      const { env } = await getCloudflareContext({ async: true });
      const hyperdrive = (env as Record<string, { connectionString: string } | undefined>).HYPERDRIVE;
      if (hyperdrive?.connectionString) {
        connectionString = hyperdrive.connectionString;
      }
    } catch {
      // getCloudflareContext throws outside of a Workers request — fine for
      // build-time static generation; fall through to DATABASE_URL below.
    }
  }

  // ── Fallback: local .env.local / .dev.vars ────────────────────────────────
  if (!connectionString) {
    connectionString = process.env.DATABASE_URL;
  }

  if (!connectionString) {
    throw new Error(
      "No database connection string found. " +
        "Set DATABASE_URL in .env.local (dev) or configure a HYPERDRIVE binding (production)."
    );
  }

  // Strip problematic SSL params that confuse the `pg` driver on Workers
  const cleanConnectionString = connectionString
    .replace("&sslrootcert=system", "")
    .replace("?sslrootcert=system", "");

  const sslRequired =
    connectionString.includes("sslmode=") || connectionString.includes("sslrootcert=");

  const pool = new Pool({
    connectionString: cleanConnectionString,
    ssl: sslRequired ? { rejectUnauthorized: false } : undefined,
  });

  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
});

/**
 * Legacy named export kept for backwards compatibility.
 * All files that previously did `import { prisma } from "@/lib/prisma"` and
 * then called `await prisma.someModel.someOp()` continue to work unchanged
 * because `prisma` is now a Proxy that lazily resolves the client on first use.
 *
 * HOW TO MIGRATE call-sites (preferred for new code):
 *   const prisma = await getPrismaClient();
 *
 * The Proxy below provides a zero-change compatibility shim for existing code.
 */
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    // Return a function that, when called, awaits the client and delegates.
    // This makes `prisma.user.findMany(...)` work as-is in async contexts.
    return new Proxy(
      {},
      {
        get(_t, method) {
          return async (...args: unknown[]) => {
            const client = await getPrismaClient();
            const model = (client as unknown as Record<string, Record<string, (...a: unknown[]) => unknown>>)[prop as string];
            return model[method as string](...args);
          };
        },
      }
    );
  },
});

export default prisma;
