/// <reference lib="webworker" />
import { renderPage } from "vike/server";
import { createMiddleware } from "hono/factory";

export const vikeHonoMiddleware = createMiddleware(
  async (c) => {
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
