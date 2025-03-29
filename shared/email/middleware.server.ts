import { Redacted } from "effect";
import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { runBackendEffect } from "../backend/effect";
import { type EmailServiceInterface, makeEmailService } from "./service";
import fp from "fastify-plugin";
declare module "fastify" {
  export interface FastifyRequest {
    emailService: EmailServiceInterface;
  }
}

const smtpVariablesSchema = z.object({
  smtpHost: z.string(),
  smtpPort: z.number(),
  smtpUser: z.string(),
  smtpPassword: z.string(),
});

export const emailServiceMiddleware = fp(async (app: FastifyInstance) => {
  const validatedData = smtpVariablesSchema.parse({
    smtpHost: process.env.SMTP_HOST,
    smtpPort: Number(process.env.SMTP_PORT),
    smtpUser: process.env.SMTP_USER,
    smtpPassword: process.env.SMTP_PASSWORD,
  });

  const data = {
    ...validatedData,
    smtpPassword: Redacted.make(validatedData.smtpPassword),
  };

  const makeEmailServiceResult = await runBackendEffect(makeEmailService(data));

  if (!makeEmailServiceResult.success) {
    throw makeEmailServiceResult.error;
  }

  const emailService = makeEmailServiceResult.result;

  app.decorateRequest("emailService", {
    getter() {
      return emailService;
    },
  });
});
