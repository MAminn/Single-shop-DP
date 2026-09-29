import type { CreateFastifyContextOptions } from "@trpc/server/adapters/fastify";
export function createContext({ req }: CreateFastifyContextOptions) {
  const db = req.db;
  const cookies = (req as { cookies?: Record<string, string | undefined> })
    .cookies;
  return {
    db,
    clientSession: req.clientSession,
    emailService: req.emailService,
    // req.ip respects Fastify's trustProxy config (set in server.ts), so
    // this is the real client IP behind Coolify/Traefik, not the proxy's.
    ipAddress: req.ip,
    userAgent: req.headers["user-agent"],
    // Meta's first-party cookies — present on any real checkout request,
    // used to enrich deferred (COD) Purchase events later.
    fbp: cookies?._fbp,
    fbc: cookies?._fbc,
  };
}
export type Context = Awaited<ReturnType<typeof createContext>>;
