import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { roleHomePath } from "@/components/layout/navConfig";

export default function HomeRedirect() {
  const user = useAuthStore((state) => state.user);
  return <Navigate to={roleHomePath(user?.role)} replace />;
}