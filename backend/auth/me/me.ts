import { Effect } from "effect";
import { validateSessionToken } from "../session";

export const me = (token: string) =>
  Effect.gen(function* ($) {
    const { session, user } = yield* $(validateSessionToken(token));

    return { session, user };
  });
