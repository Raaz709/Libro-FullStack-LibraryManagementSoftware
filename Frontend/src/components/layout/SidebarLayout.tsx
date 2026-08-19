import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate, Link } from "react-router-dom";
import { Menu, X, LogOut, BookOpen, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { authApi } from "@/api/auth.api";
import { Button } from "@/components/ui/button";
import { NAV_BY_ROLE } from "@/components/layout/navConfig";
import { cn } from "@/lib/utils";

const COLLAPSE_KEY = "libro-sidebar-collapsed";

function Brand({ collapsed }: { collapsed: boolean }) {
  return (
    <Link
      to="/"
      className={cn(
        "flex items-center gap-2.5",
        collapsed && "lg:justify-center"
      )}
      aria-label="Libro home"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-camel text-ink shadow-sm">
        <BookOpen className="h-5 w-5" />
      </div>
      <p
        className={cn(
          "text-2xl font-extrabold tracking-tight text-ink transition-opacity duration-200",
          collapsed && "lg:hidden"
        )}
      >
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
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem(COLLAPSE_KEY) === "1"
  );

  useEffect(() => {
    localStorage.setItem(COLLAPSE_KEY, collapsed ? "1" : "0");
  }, [collapsed]);

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
  const toggleCollapsed = () => setCollapsed((value) => !value);

  const navContent = (
    <nav className="flex flex-1 flex-col gap-1 px-3" aria-label="Primary">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={closeSidebar}
            title={item.label}
            className={({ isActive }) =>
              cn(
                "group relative flex items-center gap-3 rounded-soft px-3.5 py-2.5 text-sm font-semibold transition-colors duration-150",
                collapsed && "lg:justify-center lg:rounded-full lg:px-0",
                isActive
                  ? "bg-camel/20 text-ink"
                  : "text-muted hover:bg-cream hover:text-ink"
              )
            }
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className={cn("truncate transition-opacity duration-200", collapsed && "lg:hidden")}>
              {item.label}
            </span>
            {collapsed && (
              <span className="pointer-events-none absolute left-full z-50 ml-3 hidden whitespace-nowrap rounded-soft bg-ink px-2.5 py-1.5 text-xs font-semibold text-card opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100 lg:block">
                {item.label}
              </span>
            )}
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
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-line bg-card shadow-sm transition-all duration-300",
          collapsed ? "lg:w-20" : "lg:w-64",
          "w-64",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div
          className={cn(
            "flex h-16 items-center gap-1 px-5",
            collapsed && "lg:justify-center lg:px-0"
          )}
        >
          <Brand collapsed={collapsed} />
          <button
            type="button"
            onClick={toggleCollapsed}
            className="hidden rounded-full p-1.5 text-muted transition-colors hover:bg-cream hover:text-ink lg:inline-flex"
            aria-label={collapsed ? "Expand navigation" : "Collapse navigation"}
          >
            {collapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
          </button>
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
            <Link
              to="/profile"
              onClick={closeSidebar}
              className={cn("flex items-center gap-3 rounded-soft transition-colors hover:bg-cream", collapsed && "lg:flex-col lg:gap-3")}
              title="View profile"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-camel text-sm font-bold text-ink">
                {avatarInitial}
              </div>
              <div className={cn("min-w-0 flex-1 leading-tight", collapsed && "lg:hidden")}>
                <p className="truncate text-sm font-bold text-ink">
                  {displayName || user.email}
                </p>
                <p className="text-xs font-medium text-camel-dark">{user.role}</p>
              </div>
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className={cn("mt-3 w-full", collapsed && "lg:w-full")}
              aria-label="Logout"
            >
              <LogOut className={cn("h-4 w-4", collapsed ? "lg:mr-0" : "mr-2")} />
              <span className={cn(collapsed && "lg:hidden")}>Logout</span>
            </Button>
          </div>
        )}
      </aside>

      {/* Main column */}
      <div className={cn("transition-all duration-300", collapsed ? "lg:pl-20" : "lg:pl-64")}>
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