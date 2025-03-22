import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { v7 } from "uuid";

export const user = pgTable("user", {
  id: uuid("id")
    .$defaultFn(() => v7())
    .primaryKey(),
  email: text("email").unique().notNull(),
  passwordDigest: text("password").notNull(),
});

export const session = pgTable("session", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => v7()),
  token: text("token").unique().notNull(),
  userId: uuid("user_id")
    .notNull()
    .references(() => user.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  expiresAt: timestamp("expires_at", {
    withTimezone: true,
    mode: "date",
  }).notNull(),
});
