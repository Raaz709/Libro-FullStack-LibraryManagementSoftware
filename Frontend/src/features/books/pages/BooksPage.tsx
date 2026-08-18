import { useQuery } from "@tanstack/react-query";
import { booksApi } from "@/api/books.api";
import { useAuthStore } from "@/store/authStore";
import { Link } from "react-router-dom";
import {
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function BooksPage() {
  const token = useAuthStore((state) => state.token);

  const {
    data: books,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["books"],
    queryFn: booksApi.getAll,
    enabled: !!token,
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f4f1ea] p-6">
        <p className="text-[#8f8a80]">Loading books...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-[#f4f1ea] p-6">
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2">
          <p className="text-sm text-red-600">
            Failed to load books: {error.message}
          </p>
        </div>
      </div>
    );
  }

  if (!books || books.length === 0) {
    return (
      <div className="min-h-screen bg-[#f4f1ea] p-6">
        <p className="text-[#8f8a80]">No books found.</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f4f1ea] p-6">
      <div className="absolute -left-32 -top-32 h-72 w-72 rounded-full bg-[#c8a96b]/20 blur-3xl" />
      <div className="absolute -bottom-32 -right-32 h-72 w-72 rounded-full bg-[#1f2937]/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl animate-in fade-in duration-500">
        <div className="mb-8">
          <div className="mb-2 flex items-center gap-3">
            <div className="h-1 w-10 bg-[#b08a45]" />
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#9a773c]">
              Library
            </p>
          </div>

          <h1 className="text-3xl font-semibold tracking-tight text-[#1f2937]">
            Books
          </h1>
          <p className="mt-1 text-sm text-[#8f8a80]">
            Browse and manage your library collection.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {books.map((book) => (
            <Link
              key={book.id}
              to={`/books/${book.id}`}
              className="group flex min-h-56 flex-col overflow-hidden rounded-xl border border-[#ded8cc] bg-white shadow-[0_12px_35px_-15px_rgba(31,41,55,0.2)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_18px_40px_-15px_rgba(31,41,55,0.25)]"
            >
              <div className="h-1 bg-[#b08a45]" />

              <CardHeader className="gap-3 px-6 pt-6 pb-0">
                <CardTitle className="line-clamp-2 text-lg leading-7 font-semibold text-[#1f2937]">
                  {book.title}
                </CardTitle>
                <CardDescription className="text-xs tracking-wide text-[#8f8a80]">
                  {book.isbn}
                </CardDescription>
              </CardHeader>

              <CardContent className="flex flex-1 justify-between gap-6 px-6 pt-5 pb-6">
                {book.subtitle && (
                  <p className="line-clamp-2 text-sm leading-6 text-[#6b7280]">
                    {book.subtitle}
                  </p>
                )}

                <Badge
                  variant="outline"
                  className="w-fit border-[#c8a96b] bg-[#f4f1ea] px-2.5 py-1 text-[#735729]"
                >
                  {book.status}
                </Badge>
              </CardContent>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
