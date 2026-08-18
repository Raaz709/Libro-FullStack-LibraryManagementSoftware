import { Outlet, useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { authApi } from "@/api/auth.api";
import { Button } from "@/components/ui/button";

export default function Layout() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

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
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="flex h-14 items-center justify-between px-6">
          <nav className="flex items-center gap-4">
            <Link to="/books" className="font-semibold">
              Library
            </Link>
            <Link to="/books" className="text-sm text-muted-foreground">
              Books
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            {user && (
              <span className="text-sm text-muted-foreground">
                {user.email} · {user.role}
              </span>
            )}
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}