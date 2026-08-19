import { useState } from "react";
import { NavLink, Outlet, useNavigate, Link } from "react-router-dom";
import { Menu, X, LogOut, BookOpen } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { authApi } from "@/api/auth.api";
import { Button } from "@/components/ui/button";
import { NAV_BY_ROLE } from "@/components/layout/navConfig";

function Brand() {
  return (
    <Link to="/" className="flex items-center gap-2.5">
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-camel text-ink shadow-sm">
        <BookOpen className="h-5 w-5" />
      </div>
      <p className="text-2xl font-extrabold tracking-tight text-ink">
        Libr<span className="text-camel-dark">o</span>
      </p>
    </Link>
  );
}

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
              `flex items-center gap-3 rounded-soft px-3.5 py-2.5 text-sm font-semibold transition-colors duration-150 ${
                isActive
                  ? "bg-camel/20 text-ink"
                  : "text-muted hover:bg-cream hover:text-ink"
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
    <div className="min-h-screen bg-cream">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-ink/40 lg:hidden" onClick={closeSidebar} aria-hidden="true" />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-line bg-card shadow-sm transition-transform duration-200 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between gap-3 px-5">
          <Brand />
          <button
            type="button"
            onClick={closeSidebar}
            className="rounded-full p-1.5 text-muted hover:bg-cream lg:hidden"
            aria-label="Close navigation"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-1 flex-col overflow-y-auto py-4">{navContent}</div>

        {/* User + logout */}
        {user && (
          <div className="border-t border-line p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-camel text-sm font-bold text-ink">
                {avatarInitial}
              </div>
              <div className="min-w-0 flex-1 leading-tight">
                <p className="truncate text-sm font-bold text-ink">
                  {displayName || user.email}
                </p>
                <p className="text-xs font-medium text-camel-dark">{user.role}</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="mt-3 w-full"
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
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-line bg-cream/95 px-4 backdrop-blur-md lg:hidden">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="rounded-full p-1.5 text-ink hover:bg-card"
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