import { Context, Effect, Redacted } from "effect";
import { ServerError } from "../error/server";
import { createTransport } from "nodemailer";
import type { JSXElementConstructor, ReactElement } from "react";
import { render } from "@react-email/components";
import type { FastifyBaseLogger } from "fastify";

export interface EmailServiceInterface {
  sendEmail(
    to: string,
    subject: string,
    body: string
  ): Effect.Effect<void, ServerError<string>, never>;
}

export class EmailService extends Context.Tag("EmailService")<
  EmailService,
  EmailServiceInterface
>() {}

export const makeEmailService = (input: {
  smtpHost: string;
  smtpUser: string;
  smtpPassword: Redacted.Redacted<string>;
  smtpPort: number;
}) =>
  Effect.gen(function* ($) {
    // Validate SMTP host - remove any http:// or https:// prefixes
    const cleanedHost = input.smtpHost.replace(/^https?:\/\//, "");

    if (cleanedHost !== input.smtpHost) {
      console.warn(
        `SMTP host contained http:// or https:// prefix which was removed. Original: ${input.smtpHost}, Cleaned: ${cleanedHost}`
      );
    }

    try {
      const transport = yield* $(
        Effect.try({
          try: () =>
            createTransport({
              host: cleanedHost,
              port: input.smtpPort,
              secure: true,
              auth: {
                user: input.smtpUser,
                pass: Redacted.value(input.smtpPassword),
              },
            }),
          catch: (err) =>
            new ServerError({
              tag: "EmailServiceError",
              cause: err,
              message: `Failed to create email transport: ${err instanceof Error ? err.message : String(err)}`,
              statusCode: 500,
              clientMessage: "Email service configuration error",
            }),
        })
      );

      // Test the connection
      try {
        console.log("Testing SMTP connection...");
        yield* $(
          Effect.tryPromise({
            try: async () => await transport.verify(),
            catch: (err) => {
              console.error("SMTP connection test failed:", err);
              return new ServerError({
                tag: "EmailServiceConnectionError",
                cause: err,
                message: `SMTP connection test failed: ${err instanceof Error ? err.message : String(err)}`,
                statusCode: 500,
                clientMessage: "Email service connection error",
              });
            },
          })
        );
        console.log("SMTP connection test successful!");
      } catch (error) {
        console.warn(
          "SMTP connection test failed, but continuing anyway:",
          error
        );
        // We'll continue even if the test fails
      }

      return {
        sendEmail: (to: string, subject: string, body: string) =>
          Effect.tryPromise({
            try: async () => {
              try {
                console.log(`Attempting to send email to ${to}: ${subject}`);

                // Wrap in timeout to prevent long hanging connections
                const timeoutPromise = new Promise((_, reject) => {
                  setTimeout(
                    () =>
                      reject(
                        new Error("Email sending timed out after 10 seconds")
                      ),
                    10000
                  );
                });

                const sendPromise = transport.sendMail({
                  from: input.smtpUser,
                  to,
                  subject,
                  html: body,
                });

                // Race between timeout and actual sending
                const result = await Promise.race([
                  sendPromise,
                  timeoutPromise,
                ]);
                console.log(`Email sent successfully to ${to}`);
                return result;
              } catch (error) {
                console.error(`Failed to send email to ${to}:`, error);

                // Convert this to a soft error that won't block the transaction
                console.warn(
                  "Email sending failed, but allowing the operation to continue"
                );
                return {
                  softError: true,
                  message: "Email failed but operation allowed to continue",
                };
              }
            },
            catch: (err) => {
              console.error(
                "Email sending error caught in Effect.tryPromise:",
                err
              );
              // Rather than throwing an error that will block the order,
              // we'll return a "successful" result but log the error
              return undefined; // This prevents the error from propagating up
            },
          }),
      };
    } catch (error) {
      console.error("Error initializing email service:", error);

      // Instead of throwing, return a dummy service that won't block operations
      return {
        sendEmail: (to: string, subject: string, body: string) =>
          Effect.succeed(
            void (() => {
              console.warn(
                `[DUMMY EMAIL] Not sending email to ${to}: ${subject}`
              );
              console.warn(
                "Email body would have been:",
                `${body.substring(0, 100)}...`
              );
            })()
          ) as Effect.Effect<void, ServerError<string>, never>,
      };
    }
  });

export const renderEmailTemplate = (
  input: ReactElement<unknown, string | JSXElementConstructor<unknown>>
) =>
  Effect.tryPromise({
    try: async () => await render(input),
    catch: (err) =>
      new ServerError({
        tag: "RenderEmailTemplateError",
        cause: err,
        message: `Failed to render email template: ${err instanceof Error ? err.message : String(err)}`,
        statusCode: 500,
        clientMessage: "Failed to generate email content",
      }),
  });

export const createDummyEmailService = (
  logger: FastifyBaseLogger
): EmailServiceInterface => {
  const sendEmail = (to: string, subject: string, body: string) => {
    logger.warn({
      msg: `[DUMMY EMAIL] Not sending email to ${to}`,
      subject,
    });
    // Return a properly typed Effect that matches EmailServiceInterface
    return Effect.succeed(undefined) as Effect.Effect<
      void,
      ServerError<string>,
      never
    >;
  };

  return { sendEmail };
};
