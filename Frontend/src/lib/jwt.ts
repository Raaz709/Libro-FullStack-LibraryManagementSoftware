import { jwtDecode } from "jwt-decode";
import type { RawDecodedToken, DecodedUser } from "../types/auth.types";

const NAMEID_CLAIM =
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier";
const EMAIL_CLAIM =
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress";
const ROLE_CLAIM =
  "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";

export function decodeToken(token: string): DecodedUser | null {
  try {
    const raw = jwtDecode<RawDecodedToken>(token);

    return {
      userId: Number(raw[NAMEID_CLAIM]),
      email: raw[EMAIL_CLAIM],
      role: raw[ROLE_CLAIM],
      exp: raw.exp,
    };
  } catch {
    return null;
  }
}

export function isTokenExpired(exp: number): boolean {
  // exp is in seconds, Date.now() is ms
  return Date.now() >= exp * 1000;
}