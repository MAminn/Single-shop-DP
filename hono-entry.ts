import "dotenv/config";
import { Hono } from "hono";
import { vikeHonoMiddleware } from "./server/vike-handler";
import { dbHonoMiddleware } from "./shared/database/middleware";
import { trpcHonoMiddleware } from "./shared/trpc/middleware";
import { authRouter } from "./backend/auth/api";
import { authMiddlware } from "./backend/auth/middleware";

const app = new Hono<HonoContext.Env>();

app.use(dbHonoMiddleware);

app.use("/api/trpc/*", trpcHonoMiddleware({ endpoint: "/api/trpc" }));

app.route("/api/auth", authRouter);

app.use(authMiddlware);

app.all("*", vikeHonoMiddleware);

export default app;
