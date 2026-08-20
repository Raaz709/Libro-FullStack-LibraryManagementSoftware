import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate, Link } from "react-router-dom";
import { Menu, X, LogOut, BookOpen, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { authApi } from "@/api/auth.api";
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
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-camel to-camel-dark text-ink shadow-pill ring-1 ring-black/5">
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
      <p
        className={cn(
          "mb-2 px-3.5 text-[11px] font-bold uppercase tracking-[0.18em] text-muted/70",
          collapsed && "lg:px-0 lg:text-center"
        )}
      >
        Menu
      </p>
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
                "group relative flex items-center gap-3 rounded-soft py-2.5 pl-4 pr-3 text-sm font-semibold transition-all duration-150",
                collapsed && "lg:justify-center lg:rounded-full lg:px-0",
                isActive
                  ? "bg-gradient-to-r from-camel/25 to-camel/10 text-ink shadow-sm"
                  : "text-muted hover:bg-cream-deep/50 hover:text-ink"
              )
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={cn(
                    "absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-camel transition-all duration-200",
                    collapsed && "lg:hidden",
                    isActive ? "opacity-100" : "opacity-0 group-hover:opacity-40"
                  )}
                />
                <Icon className={cn("h-4 w-4 shrink-0", isActive ? "text-camel-dark" : "")} />
                <span className={cn("truncate transition-opacity duration-200", collapsed && "lg:hidden")}>
                  {item.label}
                </span>
              </>
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
        <div className="fixed inset-0 z-40 bg-ink/40 backdrop-blur-[2px] lg:hidden" onClick={closeSidebar} aria-hidden="true" />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-line bg-gradient-to-b from-card via-card to-cream/70 shadow-[10px_0_40px_-28px_rgba(17,17,17,0.35)] transition-all duration-300",
          collapsed ? "lg:w-20" : "lg:w-64",
          "w-64",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div
          className={cn(
            "flex h-16 items-center gap-1 border-b border-line-soft px-5",
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
            <div className={cn("flex items-center gap-3 rounded-soft p-2 transition-colors hover:bg-cream/70", collapsed && "lg:flex-col")}>
              <Link
                to="/profile"
                onClick={closeSidebar}
                className="flex min-w-0 flex-1 items-center gap-3"
                title="View profile"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-camel to-camel-dark text-sm font-bold text-ink shadow-pill ring-1 ring-black/5">
                  {avatarInitial}
                </div>
                <div className={cn("min-w-0 flex-1 leading-tight", collapsed && "lg:hidden")}>
                  <p className="truncate text-sm font-bold text-ink">
                    {displayName || user.email}
                  </p>
                  <p className="text-xs font-medium text-camel-dark">{user.role}</p>
                </div>
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:bg-red-50 hover:text-red-600"
                aria-label="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </aside>

      {/* Main column */}
      <div className={cn("transition-all duration-300", collapsed ? "lg:pl-20" : "lg:pl-64")}>
        {/* Top bar - mobile only */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-line bg-cream/90 px-4 backdrop-blur-md lg:hidden">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="rounded-full p-1.5 text-ink hover:bg-card"
              aria-label="Open navigation"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-camel to-camel-dark text-ink">
              <BookOpen className="h-4 w-4" />
            </div>
            <p className="text-lg font-extrabold tracking-tight text-ink">
              Libr<span className="text-camel-dark">o</span>
            </p>
          </div>
          {user && (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-camel to-camel-dark text-xs font-bold text-ink">
              {avatarInitial}
            </div>
          )}
        </header>

        <main className="min-h-[calc(100vh-4rem)] lg:min-h-screen">
          <Outlet />
        </main>
      </div>
    </div>
  );
}