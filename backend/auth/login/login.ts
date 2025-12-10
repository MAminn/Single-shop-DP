import { query } from "#root/shared/database/drizzle/db.js";
import * as Tables from "#root/shared/database/drizzle/schema.js";
import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { Effect } from "effect";
import { verify } from "@node-rs/argon2";
import { createSession, generateSessionToken } from "../session";
import { ServerError } from "#root/shared/error/server.js";
import { hashPassword } from "../shared/utils";

const verifyPassword = (hash: string, password: string) =>
  Effect.tryPromise({
    try: async () => await verify(hash, password),
    catch: (err) =>
      new ServerError({
        tag: "VerifyPasswordError",
        cause: err,
      }),
  });

export const login = (email: string, password: string) =>
  Effect.gen(function* ($) {
    const user = yield* $(
      query(
        async (db) =>
          await db
            .select()
            .from(Tables.user)
            .where(eq(Tables.user.email, email))
      ),
      Effect.map((users) => users[0])
    );

    const passwordPlaceholder = yield* $(hashPassword(randomUUID()));

    if (!user) {
      yield* $(verifyPassword(passwordPlaceholder, password));
      
      // Log failed login attempt
      yield* $(
        query(async (db) => {
          await db.insert(Tables.authLog).values({
            email,
            action: "login_failed",
            errorMessage: "User not found",
          });
        })
      );
      
      return yield* $(
        Effect.fail(
          new ServerError({
            tag: "UserNotFound",
            statusCode: 400,
            clientMessage: "Invalid credenetials",
          })
        )
      );
    }

    const passwordMatch = yield* $(
      verifyPassword(user.passwordDigest, password)
    );

    if (!passwordMatch) {
      // Log failed login attempt
      yield* $(
        query(async (db) => {
          await db.insert(Tables.authLog).values({
            userId: user.id,
            email: user.email,
            action: "login_failed",
            errorMessage: "Invalid password",
          });
        })
      );
      
      return yield* $(
        Effect.fail(
          new ServerError({
            tag: "InvalidPassword",
            statusCode: 400,
            clientMessage: "Invalid credenetials",
          })
        )
      );
    }

    // If user is not verified, check if they're a vendor with active status
    if (!user.emailVerified) {
      if (user.role === "admin") {
        // Admin users can bypass email verification
        const token = generateSessionToken();
        yield* $(createSession(token, user.id));
        return token;
      }

      // Check if the user is a vendor and has a vendorId
      if (user.role === "vendor" && user.vendorId) {
        const vendorId = user.vendorId;

        // Check if the vendor's status is active
        const vendorData = yield* $(
          query(async (db) => {
            return await db
              .select({
                status: Tables.vendor.status,
              })
              .from(Tables.vendor)
              .where(eq(Tables.vendor.id, vendorId));
          }),
          Effect.map((vendors) => vendors[0])
        );

        // If vendor status is not active, require email verification
        if (!vendorData || vendorData.status !== "active") {
          return yield* $(
            Effect.fail(
              new ServerError({
                tag: "EmailNotVerified",
                statusCode: 400,
                clientMessage: "Please verify your email before logging in",
              })
            )
          );
        }
        // Vendor status is active, allow login without email verification
      } else {
        // Not a vendor or no vendorId, require email verification
        return yield* $(
          Effect.fail(
            new ServerError({
              tag: "EmailNotVerified",
              statusCode: 400,
              clientMessage: "Please verify your email before logging in",
            })
          )
        );
      }
    }

    const token = generateSessionToken();
    yield* $(createSession(token, user.id));

    // Log successful login
    yield* $(
      query(async (db) => {
        await db.insert(Tables.authLog).values({
          userId: user.id,
          email: user.email,
          action: "login_success",
        });
      })
    );

    return token;
  });
