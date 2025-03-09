import { todoTable } from "../schema/todos";
import type { DatabaseClient } from "../db";

export function insertTodo(db: DatabaseClient, text: string) {
  return db.insert(todoTable).values({ text });
}

export function getAllTodos(db: DatabaseClient) {
  return db.select().from(todoTable);
}
