import { create } from "zustand";
import { decodeToken, isTokenExpired } from "@/lib/jwt";
import type { DecodedUser, UserProfile } from "@/types/auth.types";

const USER_PROFILE_KEY = "library-user-profile";

function getSavedProfile(userId: number): UserProfile | null {
  try {
    const savedProfile = localStorage.getItem(USER_PROFILE_KEY);
    if (!savedProfile) return null;

    const profile = JSON.parse(savedProfile) as UserProfile & { userId: number };
    return profile.userId === userId
      ? { firstName: profile.firstName, lastName: profile.lastName }
      : null;
  } catch {
    return null;
  }
}

function saveProfile(userId: number, profile: UserProfile) {
  try {
    localStorage.setItem(USER_PROFILE_KEY, JSON.stringify({ userId, ...profile }));
  } catch {
    // The current session can still use the profile if browser storage is unavailable.
  }
}

interface AuthState {
  token: string | null;
  user: DecodedUser | null;
  isAuthenticated: boolean;
  isHydrating: boolean;
  setAccessToken: (token: string, profile?: UserProfile) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isAuthenticated: false,
  isHydrating: true,

  setAccessToken: (token: string, profile?: UserProfile) => {
    const decoded = decodeToken(token);
    if (!decoded || isTokenExpired(decoded.exp)) {
      set({ token: null, user: null, isAuthenticated: false, isHydrating: false });
      return;
    }

    if (profile) {
      saveProfile(decoded.userId, profile);
    }

    set({
      token,
      user: { ...decoded, ...(profile ?? getSavedProfile(decoded.userId)) },
      isAuthenticated: true,
      isHydrating: false,
    });
  },

  logout: () => {
    try {
      localStorage.removeItem(USER_PROFILE_KEY);
    } catch {
      // Clearing the in-memory session is sufficient if browser storage is unavailable.
    }
    set({ token: null, user: null, isAuthenticated: false, isHydrating: false });
  },
}));
