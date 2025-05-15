import { useState, useEffect } from "react";

export function useSearchParams() {
  const [searchParams, setSearchParams] = useState<URLSearchParams>(
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search)
      : new URLSearchParams("")
  );

  useEffect(() => {
    const handleLocationChange = () => {
      setSearchParams(new URLSearchParams(window.location.search));
    };

    window.addEventListener("popstate", handleLocationChange);
    return () => {
      window.removeEventListener("popstate", handleLocationChange);
    };
  }, []);

  return searchParams;
}
