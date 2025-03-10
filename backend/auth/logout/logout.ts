import { Effect } from "effect";
import { invalidateSession, validateSessionToken } from "../session";

export const logout = (token: string) =>
  Effect.gen(function* ($) {
    const clientSession = yield* $(validateSessionToken(token));

    yield* $(invalidateSession(clientSession.token));

    return clientSession;
  });
