import type { FastifyInstance } from "fastify";
import { db } from "./drizzle/db";
import fp from "fastify-plugin";

declare module "fastify" {
  interface FastifyRequest {
    db: ReturnType<typeof db>;
  }
}

const drizzleFastifyPlugin = fp(async (app: FastifyInstance) => {
  const dbInstance = db();

  app.decorateRequest("db", {
    getter() {
      return dbInstance;
    },
  });
});

export default drizzleFastifyPlugin;
