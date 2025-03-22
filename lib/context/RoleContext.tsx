import React, { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";

type Role = "admin" | "vendor";

interface RoleContextType {
  userRole: Role;
  toggleRole: () => void;
  setRole: (role: Role) => void;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [userRole, setUserRole] = useState<Role>("vendor");

  useEffect(() => {
    const savedRole = localStorage.getItem("userRole");
    if (savedRole && (savedRole === "admin" || savedRole === "vendor")) {
      setUserRole(savedRole as Role);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("userRole", userRole);
  }, [userRole]);

  const toggleRole = () => {
    setUserRole((prev) => (prev === "admin" ? "vendor" : "admin"));
  };

  const setRole = (role: Role) => {
    setUserRole(role);
  };

  return (
    <RoleContext.Provider value={{ userRole, toggleRole, setRole }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error("useRole must be used within a RoleProvider");
  }
  return context;
}
