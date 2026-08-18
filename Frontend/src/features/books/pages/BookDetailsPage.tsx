import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { booksApi } from "@/api/books.api";
import { useAuthStore } from "@/store/authStore";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function DetailItem({ label, value }: { label: string; value: string | number | null }) {
  return (
    <div className="border-b border-[#eeeae2] py-4 last:border-b-0">
      <dt className="text-xs font-medium uppercase tracking-[0.14em] text-[#9a773c]">
        {label}
      </dt>
      <dd className="mt-1 text-sm text-[#374151]">{value ?? "Not specified"}</dd>
    </div>
  );
}

export default function BookDetailsPage() {
  const { bookId } = useParams();
  const token = useAuthStore((state) => state.token);
  const id = Number(bookId);
  const isValidId = Number.isInteger(id) && id > 0;

  const { data: book, isLoading, isError, error } = useQuery({
    queryKey: ["books", id],
    queryFn: () => booksApi.getById(id),
    enabled: !!token && isValidId,
    retry: false,
  });

  if (!isValidId) {
    return <BookNotFound />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f4f1ea] p-6">
        <p className="text-[#8f8a80]">Loading book details...</p>
      </div>
    );
  }

  if (isError || !book) {
    return (
      <div className="min-h-screen bg-[#f4f1ea] p-6">
        <div className="mx-auto max-w-7xl rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          Failed to load book details: {error?.message ?? "Book not found."}
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f4f1ea] p-6">
      <div className="absolute -left-32 -top-32 h-72 w-72 rounded-full bg-[#c8a96b]/20 blur-3xl" />
      <div className="absolute -bottom-32 -right-32 h-72 w-72 rounded-full bg-[#1f2937]/10 blur-3xl" />

      <div className="relative mx-auto max-w-5xl animate-in fade-in duration-500">
        <Link
          to="/books"
          className="mb-8 inline-block text-sm font-medium text-[#735729] transition-colors hover:text-[#9a773c]"
        >
          ← Back to books
        </Link>

        <Card className="overflow-hidden border-[#ded8cc] bg-white shadow-[0_12px_35px_-15px_rgba(31,41,55,0.2)]">
          <div className="h-1 bg-[#b08a45]" />
          <CardHeader className="border-b border-[#eeeae2] pb-6">
            <div className="mb-3 flex items-center justify-between gap-4">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#9a773c]">Library collection</p>
              <Badge variant="outline" className="border-[#c8a96b] bg-[#f4f1ea] text-[#735729]">
                {book.status}
              </Badge>
            </div>
            <CardTitle className="text-3xl font-semibold tracking-tight text-[#1f2937]">{book.title}</CardTitle>
            {book.subtitle && <CardDescription className="text-base text-[#6b7280]">{book.subtitle}</CardDescription>}
          </CardHeader>

          <CardContent className="grid gap-8 py-6 md:grid-cols-[1.2fr_1fr]">
            <section>
              <h2 className="text-sm font-semibold text-[#1f2937]">About this book</h2>
              <p className="mt-3 whitespace-pre-line text-sm leading-7 text-[#6b7280]">
                {book.description ?? "No description has been added for this book."}
              </p>
            </section>

            <dl>
              <DetailItem label="ISBN" value={book.isbn} />
              <DetailItem label="Language" value={book.language} />
              <DetailItem label="Edition" value={book.edition} />
              <DetailItem label="Publisher ID" value={book.publisherId} />
              <DetailItem label="Published date" value={book.publishedDate ? new Date(book.publishedDate).toLocaleDateString() : null} />
              <DetailItem label="Price" value={book.price !== null ? `$${book.price.toFixed(2)}` : null} />
            </dl>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function BookNotFound() {
  return (
    <div className="min-h-screen bg-[#f4f1ea] p-6">
      <div className="mx-auto max-w-7xl">
        <p className="text-[#8f8a80]">This book could not be found.</p>
        <Link to="/books" className="mt-4 inline-block text-sm font-medium text-[#735729] hover:text-[#9a773c]">
          Back to books
        </Link>
      </div>
    </div>
  );
}
