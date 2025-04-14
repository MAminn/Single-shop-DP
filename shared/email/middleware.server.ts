import { Redacted } from "effect";
import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { runBackendEffect } from "../backend/effect";
import {
  type EmailServiceInterface,
  makeEmailService,
  createDummyEmailService,
} from "./service";
import fp from "fastify-plugin";
import { ServerError } from "../error/server";

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
  try {
    app.log.info("Initializing email service middleware");

    // Check if we have all required SMTP env variables
    if (
      !process.env.SMTP_HOST ||
      !process.env.SMTP_PORT ||
      !process.env.SMTP_USER ||
      !process.env.SMTP_PASSWORD
    ) {
      app.log.warn("Missing SMTP configuration environment variables");
      app.decorateRequest("emailService", {
        getter() {
          return createDummyEmailService(app.log) as EmailServiceInterface;
        },
      });
      return;
    }

    // Validate SMTP configuration
    const validationResult = smtpVariablesSchema.safeParse({
      smtpHost: process.env.SMTP_HOST,
      smtpPort: Number(process.env.SMTP_PORT),
      smtpUser: process.env.SMTP_USER,
      smtpPassword: process.env.SMTP_PASSWORD,
    });

    if (!validationResult.success) {
      app.log.error({
        msg: "Invalid SMTP configuration",
        errors: validationResult.error.format(),
      });

      app.decorateRequest("emailService", {
        getter() {
          return createDummyEmailService(app.log) as EmailServiceInterface;
        },
      });
      return;
    }

    // Log sanitized config for debugging
    app.log.info({
      msg: "Setting up email service with configuration",
      host: validationResult.data.smtpHost,
      port: validationResult.data.smtpPort,
      user: validationResult.data.smtpUser,
    });

    const data = {
      ...validationResult.data,
      smtpPassword: Redacted.make(validationResult.data.smtpPassword),
    };

    const makeEmailServiceResult = await runBackendEffect(
      makeEmailService(data)
    );

    const emailService = makeEmailServiceResult.success
      ? makeEmailServiceResult.result
      : createDummyEmailService(app.log);

    app.decorateRequest("emailService", {
      getter() {
        return emailService as EmailServiceInterface;
      },
    });

    app.log.info("Email service middleware initialization complete");
  } catch (error) {
    app.log.error({
      msg: "Unexpected error in email service middleware",
      error,
    });

    app.decorateRequest("emailService", {
      getter() {
        return createDummyEmailService(app.log) as EmailServiceInterface;
      },
    });
  }
});
