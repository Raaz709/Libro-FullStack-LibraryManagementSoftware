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
        "flex items-center gap-3 px-3",
        collapsed && "lg:justify-center lg:px-0"
      )}
      aria-label="Libro home"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-camel text-ink shadow-sm">
        <BookOpen className="h-5 w-5" />
      </div>
      <p
        className={cn(
          "text-2xl font-extrabold tracking-tight text-white transition-opacity duration-200",
          collapsed && "lg:hidden"
        )}
      >
        Libr<span className="text-camel">o</span>
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
          "mb-2 px-3.5 text-[11px] font-bold uppercase tracking-[0.18em] text-white/40",
          collapsed && "lg:px-0 lg:text-center"
        )}
      >
        Catalog
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
                "group relative flex items-center gap-3 rounded-xl py-3 pl-4 pr-3 text-sm font-semibold transition-all duration-150",
                collapsed && "lg:justify-center lg:rounded-full lg:px-0",
                isActive
                  ? "bg-white text-ink shadow-sm"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              )
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={cn(
                    "absolute left-0 top-1/2 h-1.5 w-1.5 rounded-full bg-camel transition-all duration-200",
                    collapsed && "lg:hidden",
                    isActive ? "opacity-100" : "opacity-0 group-hover:opacity-40"
                  )}
                />
                <Icon className={cn("h-4 w-4 shrink-0", isActive ? "text-ink" : "text-white/70 group-hover:text-white")} />
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
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-line/20 bg-ink text-white shadow-card transition-all duration-300",
          collapsed ? "lg:w-20" : "lg:w-64",
          "w-64",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div
          className={cn(
            "flex h-20 items-center justify-between border-b border-white/10 px-4",
            collapsed && "lg:justify-center lg:px-0"
          )}
        >
          <Brand collapsed={collapsed} />
          <button
            type="button"
            onClick={toggleCollapsed}
            className="hidden rounded-full p-2 text-white/70 hover:bg-white/10 hover:text-white lg:inline-flex"
            aria-label={collapsed ? "Expand navigation" : "Collapse navigation"}
          >
            {collapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
          </button>
          <button
            type="button"
            onClick={closeSidebar}
            className="rounded-full p-2 text-white/70 hover:bg-white/10 lg:hidden"
            aria-label="Close navigation"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-1 flex-col overflow-y-auto py-6">{navContent}</div>

        {/* User + logout */}
        {user && (
          <div className="border-t border-white/10 p-4">
            <div className={cn("flex items-center gap-3 rounded-2xl bg-white/5 p-3 transition-colors hover:bg-white/10", collapsed && "lg:flex-col lg:p-2")}>
              <Link
                to="/profile"
                onClick={closeSidebar}
                title="View profile"
                className="min-w-0 flex-1"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-camel text-ink font-bold shadow-sm">
                    {avatarInitial}
                  </div>
                  <div className={cn("min-w-0 flex-1 leading-tight", collapsed && "lg:hidden")}>
                    <p className="truncate text-sm font-bold text-white">
                      {displayName || user.email}
                    </p>
                    <p className="text-xs font-medium text-camel">{user.role}</p>
                  </div>
                </div>
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white/70 hover:bg-white/10 hover:text-white transition-colors"
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
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-line bg-card/90 px-4 backdrop-blur-md lg:hidden">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="rounded-full p-1.5 text-ink hover:bg-cream"
              aria-label="Open navigation"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-camel text-ink font-bold">
              <BookOpen className="h-4 w-4" />
            </div>
            <p className="text-lg font-extrabold tracking-tight text-ink">
              Libr<span className="text-camel">o</span>
            </p>
          </div>
          {user && (
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-camel text-xs font-bold text-ink">
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