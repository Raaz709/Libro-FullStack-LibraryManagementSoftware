import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "@/lib/constants";
import { useAuthStore } from "@/store/authStore";
import LoginPage from "@/features/auth/pages/LoginPage";
import RegisterPage from "@/features/auth/pages/RegisterPage";
import ProtectedRoute from "@/routes/ProtectedRoute";
import BooksPage from "@/features/books/pages/BooksPage";

export default function App() {
  const isHydrating = useAuthStore((state) => state.isHydrating);
  const setAccessToken = useAuthStore((state) => state.setAccessToken);

  useEffect(() => {
    let cancelled = false;

    // Refresh session silently on mount using the HTTP-only cookie
    axios
      .post(`${API_BASE_URL}/auth/refresh`, {}, { withCredentials: true })
      .then((response) => {
        if (!cancelled && response.data?.token) {
          setAccessToken(response.data.token);
        }
      })
      .catch(() => {
        // If refresh fails on mount, mark hydration complete
        useAuthStore.setState({ isHydrating: false });
      });

    return () => {
      cancelled = true;
    };
  }, [setAccessToken]);

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
          <Route path="/books" element={<BooksPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}