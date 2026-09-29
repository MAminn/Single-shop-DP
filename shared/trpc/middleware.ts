import { appRouter } from "./router";
// TODO: stop using universal-middleware and directly integrate server middlewares instead. (Bati generates boilerplates that use universal-middleware https://github.com/magne4000/universal-middleware to make Bati's internal logic easier. This is temporary and will be removed soon.)
import type { Get, UniversalHandler } from "@universal-middleware/core";
import {
  type FetchCreateContextFnOptions,
  fetchRequestHandler,
} from "@trpc/server/adapters/fetch";
import { createMiddleware } from "hono/factory";

function readCookieFromHeader(
  cookieHeader: string | null,
  name: string,
): string | undefined {
  if (!cookieHeader) return undefined;
  const match = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : undefined;
}

export const trpcHonoMiddleware = (options: { endpoint: string }) =>
  createMiddleware(async (c) => {
    return fetchRequestHandler({
      endpoint: options.endpoint,
      req: c.req.raw,
      router: appRouter,
      createContext({ req, resHeaders }) {
        const cookieHeader = req.headers.get("cookie");
        return {
          db: c.var.db,
          clientSession: c.var.clientSession,
          emailService: c.var.emailService,
          req,
          resHeaders,
          ipAddress:
            req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
            req.headers.get("x-real-ip") ??
            "",
          userAgent: req.headers.get("user-agent") ?? undefined,
          fbp: readCookieFromHeader(cookieHeader, "_fbp"),
          fbc: readCookieFromHeader(cookieHeader, "_fbc"),
        };
      },
    });
  });
