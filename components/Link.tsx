import type React from "react";
import { usePageContext } from "vike-react/usePageContext";

export function Link({ href, children, className, onClick }: { href: string; children: React.ReactNode,className?: string, onClick?: () => void }) {
  const pageContext = usePageContext();
  const { urlPathname } = pageContext;
  const isActive = href === "/" ? urlPathname === href : urlPathname.startsWith(href);
  return (
    <a href={href} className={isActive ? `is-active ${className}` : undefined} onClick={onClick}>
      {children}
    </a>
  );
}
