import { redirect } from "vike/abort";
export async function guard(pageContext: Vike.PageContext) {
  if (pageContext.clientSession) {
    throw redirect("/dashboard");
  }
}
