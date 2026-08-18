import { create } from "zustand";
import { decodeToken, isTokenExpired } from "@/lib/jwt";
import type { DecodedUser } from "@/types/auth.types";

interface AuthState {
  token: string | null;
  user: DecodedUser | null;
  isAuthenticated: boolean;
  isHydrating: boolean;
  setAccessToken: (token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isAuthenticated: false,
  isHydrating: true,

  setAccessToken: (token: string) => {
    const decoded = decodeToken(token);
    if (!decoded || isTokenExpired(decoded.exp)) {
      set({ token: null, user: null, isAuthenticated: false, isHydrating: false });
      return;
    }
    set({ token, user: decoded, isAuthenticated: true, isHydrating: false });
  },

  logout: () => {
    set({ token: null, user: null, isAuthenticated: false, isHydrating: false });
  },
}));