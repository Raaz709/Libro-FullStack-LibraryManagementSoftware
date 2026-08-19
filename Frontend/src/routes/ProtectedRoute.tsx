import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { roleHomePath } from "@/components/layout/navConfig";
import type { RoleName } from "@/types/auth.types";

export default function ProtectedRoute({
  roles,
}: {
  roles?: RoleName[];
}) {
  const { isAuthenticated, isHydrating, user } = useAuthStore();
  const location = useLocation();

  if (isHydrating) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream">
        <p className="text-sm font-medium text-muted">Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // The backend remains the source of truth for authorization. This guard only
  // prevents rendering screens a user's role is not meant to see; every API
  // call is still independently authorized server-side.
  if (roles && user && !roles.includes(user.role)) {
    return <Navigate to={roleHomePath(user.role)} replace />;
  }

  return <Outlet />;
}