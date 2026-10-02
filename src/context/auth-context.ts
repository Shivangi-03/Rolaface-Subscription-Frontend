import { createContext } from "react";

export interface AuthUser {
  username?: string;
  email?: string;
  fullName?: string;
  roles?: string[];
}

export interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);