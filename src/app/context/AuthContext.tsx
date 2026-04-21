import { createContext, useContext, useState, ReactNode } from "react";
import { Employee } from "../data/employees";

interface AuthContextType {
  currentUser: Employee | null;
  login: (employeeNumber: number) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<Employee | null>(null);

  const login = (employeeNumber: number) => {
    setCurrentUser({ number: employeeNumber } as Employee);
  };

  const logout = () => {
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
