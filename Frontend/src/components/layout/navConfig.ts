import {
  LayoutDashboard,
  BookOpen,
  Library,
  ArrowLeftRight,
  RotateCcw,
  CircleDollarSign,
  Wallet,
  Heart,
  Bell,
  User,
  Users,
  ScrollText,
  FileText,
  Mail,
  BookMarked,
  ShieldCheck,
  Settings,
  type LucideIcon,
} from "lucide-react";
import type { RoleName } from "@/types/auth.types";

export interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
}

const dashboard = (to: string): NavItem => ({ label: "Dashboard", to, icon: LayoutDashboard });
const books = (to: string): NavItem => ({ label: "Books", to, icon: BookOpen });
const copies = (to: string): NavItem => ({ label: "Book Copies", to, icon: Library });
const authors = (to: string): NavItem => ({ label: "Authors", to, icon: User });
const categories = (to: string): NavItem => ({ label: "Categories", to, icon: FileText });
const publishers = (to: string): NavItem => ({ label: "Publishers", to, icon: FileText });
const borrowing = (to: string): NavItem => ({ label: "Borrowing", to, icon: ArrowLeftRight });
const returns = (to: string): NavItem => ({ label: "Returns", to, icon: RotateCcw });
const fines = (to: string): NavItem => ({ label: "Fines", to, icon: CircleDollarSign });
const payments = (to: string): NavItem => ({ label: "Payments", to, icon: Wallet });
const reservations = (to: string): NavItem => ({ label: "Reservations", to, icon: BookMarked });
const settings = (to: string): NavItem => ({ label: "Settings", to, icon: Settings });
const permissions = (to: string): NavItem => ({ label: "Permissions", to, icon: ShieldCheck });
const notifications = (to = "/notifications"): NavItem => ({ label: "Notifications", to, icon: Bell });

export const MEMBER_NAV: NavItem[] = [
  dashboard("/dashboard"),
  books("/books"),
  { label: "My Borrowing", to: "/my-borrowing", icon: ArrowLeftRight },
  { label: "My Reservations", to: "/my-reservations", icon: BookMarked },
  { label: "My Fines", to: "/my-fines", icon: CircleDollarSign },
  { label: "My Payments", to: "/my-payments", icon: Wallet },
  { label: "Favorites", to: "/favorites", icon: Heart },
  notifications(),
  { label: "Profile", to: "/profile", icon: User },
];

export const STAFF_NAV: NavItem[] = [
  books("/librarian/books"),
  copies("/librarian/copies"),
  authors("/librarian/authors"),
  categories("/librarian/categories"),
  publishers("/librarian/publishers"),
  borrowing("/librarian/borrowing"),
  returns("/librarian/returns"),
  fines("/librarian/fines"),
  payments("/librarian/payments"),
  reservations("/librarian/reservations"),
  notifications(),
];

export const LIBRARIAN_NAV: NavItem[] = [
  dashboard("/librarian"),
  ...STAFF_NAV,
];

export const ADMIN_NAV: NavItem[] = [
  dashboard("/admin"),
  { label: "Users", to: "/admin/users", icon: Users },
  books("/admin/books"),
  copies("/admin/copies"),
  authors("/admin/authors"),
  categories("/admin/categories"),
  publishers("/admin/publishers"),
  borrowing("/admin/borrowing"),
  returns("/admin/returns"),
  fines("/admin/fines"),
  payments("/admin/payments"),
  reservations("/admin/reservations"),
  { label: "Audit Logs", to: "/admin/audit-logs", icon: ScrollText },
  { label: "Activity Logs", to: "/admin/activity-logs", icon: FileText },
  { label: "Email Templates", to: "/admin/email-templates", icon: Mail },
  permissions("/admin/permissions"),
  settings("/admin/settings"),
  notifications(),
];

export const NAV_BY_ROLE: Record<RoleName, NavItem[]> = {
  Student: MEMBER_NAV,
  Faculty: MEMBER_NAV,
  Librarian: LIBRARIAN_NAV,
  Admin: ADMIN_NAV,
};

export function roleHomePath(role: RoleName | undefined): string {
  switch (role) {
    case "Admin":
      return "/admin";
    case "Librarian":
      return "/librarian";
    default:
      return "/dashboard";
  }
}

export function staffPrefix(role: RoleName | undefined): string {
  return role === "Admin" ? "/admin" : "/librarian";
}