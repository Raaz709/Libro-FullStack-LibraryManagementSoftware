import { useState } from "react";
import { NavLink, Outlet, useNavigate, Link } from "react-router-dom";
import { Menu, X, LogOut, BookOpen } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { authApi } from "@/api/auth.api";
import { Button } from "@/components/ui/button";
import { NAV_BY_ROLE } from "@/components/layout/navConfig";

export default function SidebarLayout() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = user ? NAV_BY_ROLE[user.role] ?? [] : [];
  const displayName = [user?.firstName, user?.lastName].filter(Boolean).join(" ");
  const avatarInitial = user?.firstName?.charAt(0).toUpperCase() ?? user?.email?.charAt(0).toUpperCase() ?? "?";

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {
      // even if the server call fails, clear client state
    } finally {
      logout();
      navigate("/login", { replace: true });
    }
  };

  const closeSidebar = () => setSidebarOpen(false);

  const navContent = (
    <nav className="flex flex-1 flex-col gap-1 px-3" aria-label="Primary">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={closeSidebar}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150 ${
                isActive
                  ? "bg-[#1f2937] text-[#f4f1ea]"
                  : "text-[#374151] hover:bg-[#e8e3d8]/70 hover:text-[#735729]"
              }`
            }
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="truncate">{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-[#f4f1ea]">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={closeSidebar} aria-hidden="true" />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-[#ded8cc] bg-[#faf9f6] transition-transform duration-200 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between gap-3 px-4">
          <Link to="/" className="flex items-center gap-3" onClick={closeSidebar}>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1f2937] text-[#f4f1ea]">
              <BookOpen className="h-5 w-5" />
            </div>
            <div className="leading-tight">
              <p className="text-sm font-semibold tracking-tight text-[#1f2937]">Library</p>
              <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-[#9a773c]">
                Management System
              </p>
            </div>
          </Link>
          <button
            type="button"
            onClick={closeSidebar}
            className="rounded-md p-1.5 text-[#6b7280] hover:bg-[#e8e3d8] lg:hidden"
            aria-label="Close navigation"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-1 flex-col overflow-y-auto py-4">{navContent}</div>

        {/* User + logout */}
        {user && (
          <div className="border-t border-[#ded8cc] p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1f2937] text-sm font-medium text-[#f4f1ea]">
                {avatarInitial}
              </div>
              <div className="min-w-0 flex-1 leading-tight">
                <p className="truncate text-sm font-medium text-[#374151]">
                  {displayName || user.email}
                </p>
                <p className="text-xs capitalize text-[#9a773c]">{user.role}</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="mt-3 w-full border-[#d8d3c8] bg-white text-[#374151] transition-all duration-200 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        )}
      </aside>

      {/* Main column */}
      <div className="lg:pl-64">
        {/* Top bar - mobile only */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#ded8cc] bg-[#f4f1ea]/95 px-4 backdrop-blur-md lg:hidden">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="rounded-md p-1.5 text-[#374151] hover:bg-[#e8e3d8]"
            aria-label="Open navigation"
          >
            <Menu className="h-5 w-5" />
          </button>
        </header>

        <main className="min-h-[calc(100vh-4rem)] lg:min-h-screen">
          <Outlet />
        </main>
      </div>
    </div>
  );
}