/// <reference lib="webworker" />
import { renderPage } from "vike/server";
import { createMiddleware } from "hono/factory";
import { getTemplateSelectionRaw } from "#root/backend/settings/get-template-selection-raw.js";

export const vikeHonoMiddleware = createMiddleware(
  async (c) => {
    // Fetch template selection for SSR to prevent hydration flicker
    const templateSelection = await getTemplateSelectionRaw(c.var.db);

    const pageContextInit = {
      db: c.var.db,
      clientSession: c.var.clientSession,
      urlOriginal: c.req.url,
      headersOriginal: c.req.raw.headers,
      templateSelection,
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
