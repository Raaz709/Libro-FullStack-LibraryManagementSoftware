export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

export const ROLE_MAP: Record<number, "Student" | "Faculty" | "Librarian" | "Admin"> = {
  1: "Student",
  2: "Faculty",
  3: "Librarian",
  4: "Admin",
};