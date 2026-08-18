import { Outlet, useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { authApi } from "@/api/auth.api";
import { Button } from "@/components/ui/button";

export default function Layout() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const displayName = [user?.firstName, user?.lastName].filter(Boolean).join(" ");
  const avatarInitial = user?.firstName?.charAt(0).toUpperCase() ?? user?.email.charAt(0).toUpperCase();

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

  return (
    <div className="min-h-screen bg-[#f4f1ea]">

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[#ded8cc] bg-[#f4f1ea]/95 backdrop-blur-md">

        <div className="flex h-16 items-center justify-between px-6 lg:px-10">

          {/* Brand + Navigation */}
          <nav className="flex items-center gap-8">

            <Link
              to="/books"
              className="group flex items-center gap-3"
            >
              {/* Book icon */}
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1f2937] text-[#f4f1ea] transition-transform duration-200 group-hover:-translate-y-0.5">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-5 w-5"
                >
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
                  <path d="M8 7h8M8 11h6" />
                </svg>
              </div>

              <div className="hidden sm:block">
                <p className="text-sm font-semibold leading-none tracking-tight text-[#1f2937]">
                  Library
                </p>
                <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.16em] text-[#9a773c]">
                  Management System
                </p>
              </div>
            </Link>

            {/* Books */}
            <Link
              to="/books"
              className="relative text-sm font-medium text-[#374151] transition-colors duration-200 hover:text-[#9a773c]"
            >
              Books
            </Link>
          </nav>

          {/* User section */}
          <div className="flex items-center gap-4">

            {user && (
              <div className="hidden items-center gap-3 sm:flex">

                {/* User avatar */}
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1f2937] text-sm font-medium text-[#f4f1ea]">
                  {avatarInitial}
                </div>

                <div className="hidden leading-tight md:block">
                  <p className="max-w-[220px] truncate text-sm font-medium text-[#374151]">
                    {displayName || user.email}
                  </p>

                  <p className="mt-0.5 text-xs capitalize text-[#9a773c]">
                    {user.role}
                  </p>
                </div>
              </div>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="border-[#d8d3c8] bg-white text-[#374151] transition-all duration-200 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="mr-2 h-4 w-4"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <path d="M16 17l5-5-5-5" />
                <path d="M21 12H9" />
              </svg>

              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Page content */}
      <main className="min-h-[calc(100vh-4rem)]">
        <Outlet />
      </main>
    </div>
  );
}
