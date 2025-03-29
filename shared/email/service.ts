import { Context, Effect, Redacted } from "effect";
import { ServerError } from "../error/server";
import { createTransport } from "nodemailer";
import type { JSXElementConstructor, ReactElement } from "react";
import { render } from "@react-email/components";

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
    const trasnport = yield* $(
      Effect.try({
        try: () =>
          createTransport({
            host: input.smtpHost,
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
          }),
      })
    );

    return {
      sendEmail: (to: string, subject: string, body: string) =>
        Effect.tryPromise({
          try: async () =>
            await trasnport.sendMail({
              from: input.smtpUser,
              to,
              subject,
              html: body,
            }),
          catch: (err) =>
            new ServerError({
              tag: "SendEmailServiceError",
              cause: err,
            }),
        }),
    };
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
      }),
  });
