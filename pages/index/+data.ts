import { login } from "#root/backend/auth/login/login.js";
import { me } from "#root/backend/auth/me/me.js";
import { register } from "#root/backend/auth/register/register.js";
import { DatabaseClientService } from "#root/shared/database/drizzle/db.js";
import { Effect } from "effect";

export const data = async (pageContext: Vike.PageContext) => {
  // await Effect.runPromise(
  //   register("boody@example.com", "test1234").pipe(
  //     Effect.provideService(DatabaseClientService, pageContext.db)
  //   ))
  // ).then(console.log);

  return {};
};
