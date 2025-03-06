import "./style.css";

import logoUrl from "../assets/logo.svg";
import { Link } from "../components/Link.js";

export default function LayoutDefault({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Content>{children}</Content>;
}
function Content({ children }: { children: React.ReactNode }) {
  return <div id="page-content">{children}</div>;
}
