import { describe, expect, it } from "vitest";
import { loginSchema, registerSchema } from "./authSchemas";

describe("loginSchema", () => {
  it("accepts a valid email and password", () => {
    const result = loginSchema.safeParse({ email: "a@b.com", password: "secret" });
    expect(result.success).toBe(true);
  });

  it("rejects a missing password", () => {
    const result = loginSchema.safeParse({ email: "a@b.com", password: "" });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid email", () => {
    const result = loginSchema.safeParse({ email: "not-an-email", password: "secret" });
    expect(result.success).toBe(false);
  });
});

describe("registerSchema", () => {
  const valid = {
    firstName: "Ada",
    lastName: "Lovelace",
    email: "ada@b.com",
    password: "password123",
    confirmPassword: "password123",
    roleId: 1,
  };

  it("accepts a valid student registration", () => {
    const result = registerSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("rejects mismatched passwords", () => {
    const result = registerSchema.safeParse({ ...valid, confirmPassword: "different" });
    expect(result.success).toBe(false);
  });

  it("rejects a short password", () => {
    const result = registerSchema.safeParse({ ...valid, password: "short", confirmPassword: "short" });
    expect(result.success).toBe(false);
  });

  it("requires a faculty password for faculty registrations", () => {
    const result = registerSchema.safeParse({ ...valid, roleId: 2 });
    expect(result.success).toBe(false);
    expect(result.error?.issues.some((issue) => issue.path.includes("facultyPassword"))).toBe(true);
  });

  it("accepts a faculty registration with the faculty password", () => {
    const result = registerSchema.safeParse({ ...valid, roleId: 2, facultyPassword: "FacultyKey" });
    expect(result.success).toBe(true);
  });
});