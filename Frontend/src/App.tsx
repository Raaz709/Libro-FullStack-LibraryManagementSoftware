import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { axiosClient } from "@/lib/axiosClient";
import LoginPage from "@/features/auth/pages/LoginPage";
import RegisterPage from "@/features/auth/pages/RegisterPage";
import ProtectedRoute from "@/routes/ProtectedRoute";
import Layout from "@/components/layout/NavBar";
import BooksPage from "@/features/books/pages/BooksPage";

export default function App() {
  const isHydrating = useAuthStore((state) => state.isHydrating);
  const setAccessToken = useAuthStore((state) => state.setAccessToken);
  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    let cancelled = false;

    axiosClient
      .post("/auth/refresh")
      .then((response) => {
        if (!cancelled) {
          setAccessToken(response.data.token);
        }
      })
      .catch(() => {
        if (!cancelled) {
          logout();
        }
      });

    return () => {
      cancelled = true;
    };
  }, [setAccessToken, logout]);

  if (isHydrating) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/books" element={<BooksPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}