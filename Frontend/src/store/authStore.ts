import { create } from "zustand";
import { decodeToken, isTokenExpired } from "../lib/jwt";
import type { DecodedUser } from "../types/auth.types";

interface AuthState {
  token: string | null;
  user: DecodedUser | null;
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
  hydrate: () => void;
}

const TOKEN_KEY = "library_auth_token";

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isAuthenticated: false,

  login: (token: string) => {
    const decoded = decodeToken(token);
    if (!decoded || isTokenExpired(decoded.exp)) {
      return;
    }
    localStorage.setItem(TOKEN_KEY, token);
    set({ token, user: decoded, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    set({ token: null, user: null, isAuthenticated: false });
  },

  hydrate: () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return;

    const decoded = decodeToken(token);
    if (!decoded || isTokenExpired(decoded.exp)) {
      localStorage.removeItem(TOKEN_KEY);
      return;
    }
    set({ token, user: decoded, isAuthenticated: true });
  },
}));