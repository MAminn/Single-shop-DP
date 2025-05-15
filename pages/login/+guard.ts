import { redirect } from "vike/abort";
export async function guard(pageContext: Vike.PageContext) {
  if (pageContext.clientSession) {
    // Redirect normal users to the homepage instead of dashboard
    if (pageContext.clientSession.role === "user") {
      throw redirect("/");
    }
    // Only admin and vendor roles should access the dashboard
    throw redirect("/dashboard");
  }
}
