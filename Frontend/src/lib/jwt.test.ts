import { describe, expect, it, vi } from "vitest";
import { decodeToken, isTokenExpired } from "./jwt";

vi.mock("jwt-decode", () => ({
  jwtDecode: vi.fn((token: string) => {
    const [header, payload] = token.split(".");
    if (!header || !payload) {
      throw new Error("Invalid token");
    }
    return JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
  }),
}));

const NAMEID =
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier";
const EMAIL =
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress";
const ROLE =
  "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";

function base64Url(input: string): string {
  return btoa(unescape(encodeURIComponent(input)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function makeToken(payload: Record<string, unknown>): string {
  const header = base64Url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = base64Url(JSON.stringify(payload));
  return `${header}.${body}.signature`;
}

describe("decodeToken", () => {
  it("decodes a valid token into a DecodedUser", () => {
    const token = makeToken({
      [NAMEID]: "42",
      [EMAIL]: "student@libro.test",
      [ROLE]: "Student",
      exp: 2000000000,
    });

    const user = decodeToken(token);

    expect(user).toEqual({
      userId: 42,
      email: "student@libro.test",
      role: "Student",
      exp: 2000000000,
    });
  });

  it("returns null for a malformed token", () => {
    expect(decodeToken("not-a-token")).toBeNull();
  });
});

describe("isTokenExpired", () => {
  it("returns true for an expired token", () => {
    expect(isTokenExpired(1)).toBe(true);
  });

  it("returns false for a token that expires in the future", () => {
    const future = Math.floor(Date.now() / 1000) + 3600;
    expect(isTokenExpired(future)).toBe(false);
  });
});