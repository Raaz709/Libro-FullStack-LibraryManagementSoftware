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
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-50 text-slate-600">
        <BookOpen className="h-5 w-5 text-slate-500" />
      </div>
      <p
        className={cn(
          "text-2xl font-extrabold tracking-tight text-slate-900 transition-opacity duration-200",
          collapsed && "lg:hidden"
        )}
      >
        Libr<span className="text-slate-500">o</span>
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
          "mb-2 px-3.5 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500/60",
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
                "group relative flex items-center gap-3 rounded-lg py-2.5 pl-4 pr-3 text-sm font-semibold transition-all duration-150",
                collapsed && "lg:justify-center lg:rounded-full lg:px-0",
                isActive
                  ? "bg-indigo-50 text-indigo-600"
                  : "hover:bg-slate-50 hover:text-slate-600"
              )
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={cn(
                    "absolute left-0 top-1/2 h-1 w-1 rounded-full bg-indigo-400 transition-all duration-200",
                    collapsed && "lg:hidden",
                    isActive ? "opacity-100" : "opacity-0 group-hover:opacity-40"
                  )}
                />
                <Icon className={cn("h-4 w-4 shrink-0", isActive ? "text-indigo-600" : "")} />
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
    <div className="min-h-screen bg-slate-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-[2px] lg:hidden" onClick={closeSidebar} aria-hidden="true" />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-slate-200 bg-white shadow-sm transition-all duration-300",
          collapsed ? "lg:w-20" : "lg:w-64",
          "w-64",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div
          className={cn(
            "flex h-16 items-center gap-1 border-b border-slate-200 px-3",
            collapsed && "lg:justify-center lg:px-0"
          )}
        >
          <Brand collapsed={collapsed} />
          <button
            type="button"
            onClick={toggleCollapsed}
            className="hidden rounded-full p-1.5 text-slate-500 hover:bg-slate-50 hover:text-slate-900 lg:inline-flex"
            aria-label={collapsed ? "Expand navigation" : "Collapse navigation"}
          >
            {collapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
          </button>
          <button
            type="button"
            onClick={closeSidebar}
            className="rounded-full p-1.5 text-slate-500 hover:bg-slate-50 lg:hidden"
            aria-label="Close navigation"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-1 flex-col overflow-y-auto py-4">{navContent}</div>

        {/* User + logout */}
        {user && (
          <div className="border-t border-slate-200 p-4">
            <div className={cn("flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-slate-50/70", collapsed && "lg:flex-col")}>
              <Link
                to="/profile"
                onClick={closeSidebar}
                title="View profile"
              >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-600">
                    {avatarInitial}
                  </div>
                  <div className={cn("min-w-0 flex-1 leading-tight", collapsed && "lg:hidden")}>
                    <p className="truncate text-sm font-bold text-slate-900">
                      {displayName || user.email}
                    </p>
                    <p className="text-xs font-medium text-slate-500">{user.role}</p>
                  </div>
                </div>
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
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
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur-md lg:hidden">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="rounded-full p-1.5 text-slate-600 hover:bg-slate-50"
              aria-label="Open navigation"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 text-slate-600">
              <BookOpen className="h-4 w-4" />
            </div>
            <p className="text-lg font-extrabold tracking-tight text-slate-900">
              Libr<span className="text-slate-500">o</span>
            </p>
          </div>
          {user && (
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 text-xs font-bold text-slate-600">
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