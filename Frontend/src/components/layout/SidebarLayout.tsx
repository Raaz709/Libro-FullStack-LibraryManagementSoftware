import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate, Link } from "react-router-dom";
import { Menu, X, LogOut, BookOpen, PanelLeftClose, PanelLeftOpen, Sparkles } from "lucide-react";
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
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FF7138] text-white shadow-md">
        <BookOpen className="h-5 w-5" />
      </div>
      <p
        className={cn(
          "text-2xl font-extrabold tracking-tight text-[#202020] transition-opacity duration-200",
          collapsed && "lg:hidden"
        )}
      >
        Libr<span className="text-[#FF7138]">o</span>
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
      // ignore
    } finally {
      logout();
      navigate("/login", { replace: true });
    }
  };

  const closeSidebar = () => setSidebarOpen(false);
  const toggleCollapsed = () => setCollapsed((value) => !value);

  const navContent = (
    <nav className="flex flex-1 flex-col gap-1.5 px-3" aria-label="Primary">
      <p
        className={cn(
          "mb-2 px-3.5 text-[11px] font-bold uppercase tracking-[0.18em] text-[#8C8C8C]",
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
                "group relative flex items-center gap-3 rounded-xl py-3 pl-4 pr-3 text-sm font-semibold transition-all duration-150",
                collapsed && "lg:justify-center lg:rounded-full lg:px-0",
                isActive
                  ? "bg-[#FF7138] text-white shadow-[0_4px_14px_rgba(255,113,56,0.3)] font-bold"
                  : "text-[#5F5F5F] hover:bg-[#FFE1D2]/50 hover:text-[#202020]"
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon className={cn("h-4 w-4 shrink-0 transition-transform group-hover:scale-110", isActive ? "text-white" : "text-[#5F5F5F]")} />
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
    <div className="min-h-screen bg-[#FDE9E1] p-3 sm:p-4 lg:p-6 flex items-center justify-center">
      {/* Floating Application Container */}
      <div className="relative w-full max-w-[1536px] min-h-[calc(100vh-2rem)] lg:min-h-[calc(100vh-3rem)] rounded-[32px] bg-white border border-[#EEEEEA] shadow-[0_10px_40px_rgba(0,0,0,0.06)] overflow-hidden flex flex-col lg:flex-row">
        
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px] lg:hidden" onClick={closeSidebar} aria-hidden="true" />
        )}

        {/* Sidebar */}
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-[#EEEEEA] bg-white transition-all duration-300 lg:relative lg:translate-x-0",
            collapsed ? "lg:w-20" : "lg:w-72",
            "w-72",
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div
            className={cn(
              "flex h-20 items-center justify-between border-b border-[#EEEEEA] px-4",
              collapsed && "lg:justify-center lg:px-0"
            )}
          >
            <Brand collapsed={collapsed} />
            <button
              type="button"
              onClick={toggleCollapsed}
              className="hidden rounded-full p-2 text-[#5F5F5F] hover:bg-[#FFE1D2]/40 hover:text-[#202020] lg:inline-flex transition-colors"
              aria-label={collapsed ? "Expand navigation" : "Collapse navigation"}
            >
              {collapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
            </button>
            <button
              type="button"
              onClick={closeSidebar}
              className="rounded-full p-2 text-[#5F5F5F] hover:bg-[#FFE1D2]/40 lg:hidden"
              aria-label="Close navigation"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex flex-1 flex-col overflow-y-auto py-6">{navContent}</div>

          {/* Promotional Card */}
          {!collapsed && (
            <div className="mx-4 mb-4 rounded-2xl bg-[#FFF3EE] p-4 border border-[#FFE1D2]">
              <div className="flex items-center gap-2 text-[#FF7138] mb-1.5 font-bold text-xs uppercase tracking-wider">
                <Sparkles className="h-4 w-4" /> Library Pro
              </div>
              <p className="text-xs text-[#5F5F5F] leading-relaxed mb-3">
                Unlock advanced AI cataloging and automated fine reminders.
              </p>
              <button type="button" className="w-full rounded-xl bg-[#FF7138] py-2 text-xs font-bold text-white shadow-[0_4px_12px_rgba(255,113,56,0.25)] hover:bg-[#E05D26] transition-colors">
                Upgrade Plan
              </button>
            </div>
          )}

          {/* User + logout */}
          {user && (
            <div className="border-t border-[#EEEEEA] p-4">
              <div className={cn("flex items-center gap-3 rounded-2xl bg-[#F6F6F2] p-3 transition-colors hover:bg-[#FFE1D2]/30", collapsed && "lg:flex-col lg:p-2")}>
                <Link
                  to="/profile"
                  onClick={closeSidebar}
                  title="View profile"
                  className="min-w-0 flex-1"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FF7138] text-white font-bold shadow-sm">
                      {avatarInitial}
                    </div>
                    <div className={cn("min-w-0 flex-1 leading-tight", collapsed && "lg:hidden")}>
                      <p className="truncate text-sm font-bold text-[#202020]">
                        {displayName || user.email}
                      </p>
                      <p className="text-xs font-medium text-[#FF7138] capitalize">{user.role}</p>
                    </div>
                  </div>
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#5F5F5F] hover:bg-white hover:text-[#FF7138] transition-colors shadow-sm"
                  aria-label="Logout"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </aside>

        {/* Main column */}
        <div className="flex-1 flex flex-col min-w-0 bg-white overflow-y-auto">
          {/* Top bar - mobile only */}
          <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#EEEEEA] bg-white/90 px-4 backdrop-blur-md lg:hidden">
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="rounded-full p-2 text-[#202020] hover:bg-[#F6F6F2]"
                aria-label="Open navigation"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FF7138] text-white font-bold">
                <BookOpen className="h-4 w-4" />
              </div>
              <p className="text-lg font-extrabold tracking-tight text-[#202020]">
                Libr<span className="text-[#FF7138]">o</span>
              </p>
            </div>
            {user && (
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FF7138] text-xs font-bold text-white">
                {avatarInitial}
              </div>
            )}
          </header>

          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
