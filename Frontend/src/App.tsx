import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { axiosClient } from "@/lib/axiosClient";
import LoginPage from "@/features/auth/pages/LoginPage";
import RegisterPage from "@/features/auth/pages/RegisterPage";
import ProtectedRoute from "@/routes/ProtectedRoute";
import HomeRedirect from "@/routes/HomeRedirect";
import SidebarLayout from "@/components/layout/SidebarLayout";
import BooksPage from "@/features/books/pages/BooksPage";
import BookDetailsPage from "@/features/books/pages/BookDetailsPage";
import AuthorsPage from "@/features/authors/pages/AuthorsPage";
import CategoriesPage from "@/features/categories/pages/CategoriesPage";
import PublishersPage from "@/features/publishers/pages/PublishersPage";
import BookCopiesPage from "@/features/bookCopies/pages/BookCopiesPage";
import BorrowingPage from "@/features/borrowing/pages/BorrowingPage";
import ReturnsPage from "@/features/borrowing/pages/ReturnsPage";
import FinesPage from "@/features/fines/pages/FinesPage";
import PaymentsPage from "@/features/payments/pages/PaymentsPage";
import UsersPage from "@/features/users/pages/UsersPage";
import AuditLogsPage from "@/features/admin-logs/pages/AuditLogsPage";
import ActivityLogsPage from "@/features/admin-logs/pages/ActivityLogsPage";
import EmailTemplatesPage from "@/features/email-templates/pages/EmailTemplatesPage";
import AdminDashboardPage from "@/features/dashboard/pages/AdminDashboardPage";
import ProfilePage from "@/features/profile/pages/ProfilePage";
import FavouritesPage from "@/features/favourites/pages/FavouritesPage";
import NotificationsPage from "@/features/notifications/pages/NotificationsPage";
import MemberDashboardPage from "@/features/dashboard/pages/MemberDashboardPage";
import LibrarianDashboardPage from "@/features/dashboard/pages/LibrarianDashboardPage";
import MyBorrowingPage from "@/features/my/pages/MyBorrowingPage";
import MyFinesPage from "@/features/my/pages/MyFinesPage";
import MyPaymentsPage from "@/features/my/pages/MyPaymentsPage";

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
              <Route path="/dashboard" element={<MemberDashboardPage />} />
              <Route path="/books" element={<BooksPage />} />
              <Route path="/my-borrowing" element={<MyBorrowingPage />} />
              <Route path="/my-fines" element={<MyFinesPage />} />
              <Route path="/my-payments" element={<MyPaymentsPage />} />
              <Route path="/favorites" element={<FavouritesPage />} />
            </Route>

            {/* Librarian routes */}
            <Route element={<ProtectedRoute roles={["Librarian"]} />}>
              <Route path="/librarian" element={<LibrarianDashboardPage />} />
              <Route path="/librarian/books" element={<BooksPage />} />
              <Route path="/librarian/copies" element={<BookCopiesPage />} />
              <Route path="/librarian/authors" element={<AuthorsPage />} />
              <Route path="/librarian/categories" element={<CategoriesPage />} />
              <Route path="/librarian/publishers" element={<PublishersPage />} />
              <Route path="/librarian/borrowing" element={<BorrowingPage />} />
              <Route path="/librarian/returns" element={<ReturnsPage />} />
              <Route path="/librarian/fines" element={<FinesPage />} />
              <Route path="/librarian/payments" element={<PaymentsPage />} />
            </Route>

            {/* Admin routes */}
            <Route element={<ProtectedRoute roles={["Admin"]} />}>
              <Route path="/admin" element={<AdminDashboardPage />} />
              <Route path="/admin/users" element={<UsersPage />} />
              <Route path="/admin/books" element={<BooksPage />} />
              <Route path="/admin/copies" element={<BookCopiesPage />} />
              <Route path="/admin/authors" element={<AuthorsPage />} />
              <Route path="/admin/categories" element={<CategoriesPage />} />
              <Route path="/admin/publishers" element={<PublishersPage />} />
              <Route path="/admin/borrowing" element={<BorrowingPage />} />
              <Route path="/admin/returns" element={<ReturnsPage />} />
              <Route path="/admin/fines" element={<FinesPage />} />
              <Route path="/admin/payments" element={<PaymentsPage />} />
              <Route path="/admin/audit-logs" element={<AuditLogsPage />} />
              <Route path="/admin/activity-logs" element={<ActivityLogsPage />} />
              <Route path="/admin/email-templates" element={<EmailTemplatesPage />} />
            </Route>

            {/* Shared for all authenticated roles */}
            <Route path="/books/:bookId" element={<BookDetailsPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
        </Route>

        <Route path="*" element={<HomeRedirect />} />
      </Routes>
    </BrowserRouter>
  );
}