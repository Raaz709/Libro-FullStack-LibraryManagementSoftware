import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { axiosClient } from "@/lib/axiosClient";
import LoginPage from "@/features/auth/pages/LoginPage";
import RegisterPage from "@/features/auth/pages/RegisterPage";
import ProtectedRoute from "@/routes/ProtectedRoute";
import HomeRedirect from "@/routes/HomeRedirect";
import SidebarLayout from "@/components/layout/SidebarLayout";
import ComingSoon from "@/components/ComingSoon";
import BooksPage from "@/features/books/pages/BooksPage";
import BookDetailsPage from "@/features/books/pages/BookDetailsPage";
import AuthorsPage from "@/features/authors/pages/AuthorsPage";
import CategoriesPage from "@/features/categories/pages/CategoriesPage";
import PublishersPage from "@/features/publishers/pages/PublishersPage";
import BookCopiesPage from "@/features/bookCopies/pages/BookCopiesPage";

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
      <div className="flex min-h-screen items-center justify-center bg-cream">
        <p className="text-sm font-medium text-muted">Loading...</p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<SidebarLayout />}>
            <Route index element={<HomeRedirect />} />
            <Route path="/" element={<HomeRedirect />} />

            {/* Member routes (Student & Faculty) */}
            <Route element={<ProtectedRoute roles={["Student", "Faculty"]} />}>
              <Route path="/dashboard" element={<ComingSoon />} />
              <Route path="/books" element={<BooksPage />} />
              <Route path="/books/:bookId" element={<BookDetailsPage />} />
              <Route path="/my-borrowing" element={<ComingSoon />} />
              <Route path="/my-fines" element={<ComingSoon />} />
              <Route path="/my-payments" element={<ComingSoon />} />
              <Route path="/favorites" element={<ComingSoon />} />
              <Route path="/profile" element={<ComingSoon />} />
            </Route>

            {/* Librarian routes */}
            <Route element={<ProtectedRoute roles={["Librarian"]} />}>
              <Route path="/librarian" element={<ComingSoon />} />
              <Route path="/librarian/books" element={<ComingSoon />} />
              <Route path="/librarian/copies" element={<BookCopiesPage />} />
              <Route path="/librarian/authors" element={<AuthorsPage />} />
              <Route path="/librarian/categories" element={<CategoriesPage />} />
              <Route path="/librarian/publishers" element={<PublishersPage />} />
              <Route path="/librarian/borrowing" element={<ComingSoon />} />
              <Route path="/librarian/returns" element={<ComingSoon />} />
              <Route path="/librarian/fines" element={<ComingSoon />} />
              <Route path="/librarian/payments" element={<ComingSoon />} />
            </Route>

            {/* Admin routes */}
            <Route element={<ProtectedRoute roles={["Admin"]} />}>
              <Route path="/admin" element={<ComingSoon />} />
              <Route path="/admin/users" element={<ComingSoon />} />
              <Route path="/admin/books" element={<ComingSoon />} />
              <Route path="/admin/copies" element={<BookCopiesPage />} />
              <Route path="/admin/authors" element={<AuthorsPage />} />
              <Route path="/admin/categories" element={<CategoriesPage />} />
              <Route path="/admin/publishers" element={<PublishersPage />} />
              <Route path="/admin/borrowing" element={<ComingSoon />} />
              <Route path="/admin/returns" element={<ComingSoon />} />
              <Route path="/admin/fines" element={<ComingSoon />} />
              <Route path="/admin/payments" element={<ComingSoon />} />
              <Route path="/admin/audit-logs" element={<ComingSoon />} />
              <Route path="/admin/activity-logs" element={<ComingSoon />} />
              <Route path="/admin/email-templates" element={<ComingSoon />} />
            </Route>

            {/* Shared for all authenticated roles */}
            <Route path="/notifications" element={<ComingSoon />} />
          </Route>
        </Route>

        <Route path="*" element={<HomeRedirect />} />
      </Routes>
    </BrowserRouter>
  );
}