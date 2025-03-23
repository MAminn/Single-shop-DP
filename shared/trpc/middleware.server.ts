import {
  fastifyTRPCPlugin,
  type FastifyTRPCPluginOptions,
} from "@trpc/server/adapters/fastify";
import { createContext } from "./context.server.js";
import { appRouter, type AppRouter } from "./router.js";
import fp from "fastify-plugin";

export const fastifyTRPCMiddleware = fp((app) => {
  app.register(fastifyTRPCPlugin, {
    prefix: "/api/trpc",
    trpcOptions: {
      router: appRouter,
      createContext,
      onError({ path, error }) {
        // report to error monitoring
        console.error(`Error in tRPC handler on path '${path}':`, error);
      },
    } satisfies FastifyTRPCPluginOptions<AppRouter>["trpcOptions"],
  });
});
