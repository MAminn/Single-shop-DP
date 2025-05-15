import { redirect } from "vike/abort";

export async function guard(pageContext: Vike.PageContext) {
  if (!pageContext.clientSession) {
    throw redirect("/login");
  }

  // Redirect users with 'user' role to the homepage
  if (pageContext.clientSession.role === "user") {
    throw redirect("/");
  }
}
