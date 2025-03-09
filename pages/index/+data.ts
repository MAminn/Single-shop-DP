import { todoTable } from "#root/shared/database/drizzle/schema/todos.js";

export const data = async (pageContext: Vike.PageContext) => {
  const db = pageContext.db;

  const todos = await db.select().from(todoTable);
  console.log(todos);
  return {};
};
