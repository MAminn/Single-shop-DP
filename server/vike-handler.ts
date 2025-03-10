/// <reference lib="webworker" />
import { renderPage } from "vike/server";
// TODO: stop using universal-middleware and directly integrate server middlewares instead. (Bati generates boilerplates that use universal-middleware https://github.com/magne4000/universal-middleware to make Bati's internal logic easier. This is temporary and will be removed soon.)
import type { Get, UniversalHandler } from "@universal-middleware/core";
import { createMiddleware } from "hono/factory";

export const vikeHonoMiddleware = createMiddleware<HonoContext.Env>(
  async (c) => {
    console.log(c.var.clientSession)
    const pageContextInit = {
      db: c.var.db,
      clientSession: c.var.clientSession,
      urlOriginal: c.req.url,
      headersOriginal: c.req.raw.headers,
    };
    const pageContext = await renderPage(pageContextInit);
    const response = pageContext.httpResponse;

    const { readable, writable } = new TransformStream();
    response.pipe(writable);

    return new Response(readable, {
      status: response.statusCode,
      headers: response.headers,
    });
  }
);
