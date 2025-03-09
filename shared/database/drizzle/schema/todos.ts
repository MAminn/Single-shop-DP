import { integer, pgTable, text } from "drizzle-orm/pg-core";

export const todoTable = pgTable("todos", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  text: text("text").notNull(),
});

export type TodoItem = typeof todoTable.$inferSelect;
export type TodoInsert = typeof todoTable.$inferInsert;
