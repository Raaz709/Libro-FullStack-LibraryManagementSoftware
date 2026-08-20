import { useQueries, useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { Heart } from "lucide-react";
import { booksApi } from "@/api/books.api";
import { useAuthStore } from "@/store/authStore";
import { useFavoriteToggle } from "@/features/favourites/hooks/useFavorites";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

function DetailItem({ label, value }: { label: string; value: string | number | null }) {
  return (
    <div className="border-b border-line-soft py-4 last:border-b-0">
      <dt className="text-xs font-medium uppercase tracking-[0.14em] text-camel">{label}</dt>
      <dd className="mt-1.5 text-sm leading-6 text-ink">{value ?? "Not specified"}</dd>
    </div>
  );
}

function InventoryItem({ label, value, tone = "default" }: { label: string; value: number | string; tone?: "default" | "available" | "borrowed" }) {
  const colors = {
    default: "bg-cream text-ink",
    available: "bg-emerald-50 text-emerald-700",
    borrowed: "bg-amber-50 text-amber-700",
  };

  return (
    <div className={`rounded-xl px-4 py-4 ${colors[tone]}`}>
      <p className="text-2xl font-semibold tracking-tight">{value}</p>
      <p className="mt-1 text-xs font-medium uppercase tracking-[0.12em] opacity-75">{label}</p>
    </div>
  );
}

function formatDate(value: string | null) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatPrice(value: number | null) {
  if (value === null) return null;
  return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(value);
}

export default function BookDetailsPage() {
  const { bookId } = useParams();
  const token = useAuthStore((state) => state.token);
  const role = useAuthStore((state) => state.user?.role);
  const booksPath = role === "Admin" ? "/admin/books" : role === "Librarian" ? "/librarian/books" : "/books";
  const id = Number(bookId);
  const isValidId = Number.isInteger(id) && id > 0;
  const queryEnabled = !!token && isValidId;

  const { data: book, isLoading, isError, error } = useQuery({
    queryKey: ["books", id],
    queryFn: () => booksApi.getById(id),
    enabled: queryEnabled,
    retry: false,
  });

  const [authorsQuery, categoriesQuery, copiesQuery, publisherQuery] = useQueries({
    queries: [
      { queryKey: ["books", id, "authors"], queryFn: () => booksApi.getAuthors(id), enabled: queryEnabled, retry: false },
      { queryKey: ["books", id, "categories"], queryFn: () => booksApi.getCategories(id), enabled: queryEnabled, retry: false },
      { queryKey: ["books", id, "copies"], queryFn: () => booksApi.getCopies(id), enabled: queryEnabled, retry: false },
      { queryKey: ["publishers", book?.publisherId], queryFn: () => booksApi.getPublisher(book!.publisherId), enabled: queryEnabled && !!book?.publisherId, retry: false },
    ],
  });

  const favoriteToggle = useFavoriteToggle(id, queryEnabled);

  if (!isValidId) return <BookNotFound booksPath={booksPath} />;
  if (isLoading) return <PageMessage message="Loading book details..." />;
  if (isError || !book) {
    return <PageMessage message={`Failed to load book details: ${error?.message ?? "Book not found."}`} error />;
  }

  const authors = authorsQuery.data ?? [];
  const categories = categoriesQuery.data ?? [];
  const copies = copiesQuery.data ?? [];
  const authorNames = authors.map((author) => `${author.firstName} ${author.lastName}`.trim());
  const availableCopies = copies.filter((copy) => copy.status.toLowerCase() === "available").length;
  const borrowedCopies = copies.filter((copy) => copy.status.toLowerCase() === "borrowed").length;

  return (
    <div className="relative min-h-screen overflow-hidden bg-cream p-6">
      <div className="absolute -left-32 -top-32 h-72 w-72 rounded-full bg-camel/20 blur-3xl" />
      <div className="absolute -bottom-32 -right-32 h-72 w-72 rounded-full bg-ink/10 blur-3xl" />

      <div className="relative mx-auto max-w-6xl animate-in fade-in duration-500">
        <Link to={booksPath} className="mb-8 inline-block text-sm font-medium text-camel-dark transition-colors hover:text-camel">
          ← Back to books
        </Link>

        <Card className="overflow-hidden border-line bg-white shadow-[0_12px_35px_-15px_rgba(31,41,55,0.2)]">
          <div className="h-1 bg-camel" />
          <CardContent className="grid gap-8 py-8 md:grid-cols-[220px_1fr]">
            <div className="mx-auto w-full max-w-[220px] md:mx-0">
              {book.coverImageUrl ? (
                <img src={book.coverImageUrl} alt={`Cover of ${book.title}`} className="aspect-[2/3] w-full rounded-lg border border-line object-cover shadow-lg" />
              ) : (
                <div className="relative flex aspect-[2/3] items-center justify-center overflow-hidden rounded-lg border border-line bg-cream shadow-lg">
                  <div className="absolute inset-x-0 top-0 h-2 bg-camel" />
                  <div className="absolute -right-10 -bottom-10 h-36 w-36 rounded-full bg-camel/20" />
                  <div className="relative flex flex-col items-center text-center">
                    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-16 w-16 text-camel" aria-hidden="true">
                      <path d="M11 14.5A5.5 5.5 0 0 1 16.5 9H52v43H16.5A5.5 5.5 0 0 1 11 46.5v-32Z" />
                      <path d="M16.5 9H52M16.5 30H52M20 18h24M20 23h17M20 39h24M20 44h14" />
                    </svg>
                    <p className="mt-4 px-5 text-xs font-medium uppercase tracking-[0.18em] text-camel-dark">Library collection</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col justify-center">
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-camel">Library collection</p>
                <Badge variant="outline" className="border-camel bg-cream text-camel-dark">{book.status}</Badge>
                <button
                  type="button"
                  onClick={() => favoriteToggle.toggle()}
                  disabled={favoriteToggle.isPending}
                  className="inline-flex items-center gap-1.5 rounded-full border border-line bg-card px-3 py-1 text-xs font-semibold text-ink transition-colors hover:border-camel disabled:opacity-50"
                  aria-pressed={favoriteToggle.isFavorite}
                  aria-label={favoriteToggle.isFavorite ? "Remove from favorites" : "Add to favorites"}
                >
                  <Heart className={`h-3.5 w-3.5 ${favoriteToggle.isFavorite ? "fill-red-600 text-red-600" : "text-camel"}`} />
                  {favoriteToggle.isFavorite ? "Saved" : "Save"}
                </button>
              </div>
              <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">{book.title}</h1>
              {book.subtitle && <p className="mt-2 text-lg text-muted">{book.subtitle}</p>}

              <div className="mt-6">
                <p className="text-xs font-medium uppercase tracking-[0.14em] text-camel">Author{authorNames.length === 1 ? "" : "s"}</p>
                <p className="mt-2 text-base font-medium text-ink">
                  {authorsQuery.isLoading ? "Loading authors..." : authorNames.join(", ") || "No authors assigned"}
                </p>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {categoriesQuery.isLoading && <Badge variant="secondary">Loading categories...</Badge>}
                {!categoriesQuery.isLoading && categories.length === 0 && <Badge variant="secondary">Uncategorized</Badge>}
                {categories.map((category) => <Badge key={category.id} variant="secondary">{category.name}</Badge>)}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.35fr_1fr]">
          <Card className="border-line bg-white shadow-[0_12px_35px_-15px_rgba(31,41,55,0.16)]">
            <CardContent className="py-7">
              <SectionHeading title="Book information" />
              <p className="mt-4 whitespace-pre-line text-sm leading-7 text-muted">{book.description ?? "No description has been added for this book."}</p>
              <dl className="mt-6 grid gap-x-8 md:grid-cols-2">
                <DetailItem label="ISBN" value={book.isbn} />
                <DetailItem label="Language" value={book.language} />
                <DetailItem label="Edition" value={book.edition} />
                <DetailItem label="Publisher" value={publisherQuery.isLoading ? "Loading..." : publisherQuery.data?.name ?? "Not specified"} />
                <DetailItem label="Published date" value={formatDate(book.publishedDate)} />
                <DetailItem label="Price" value={formatPrice(book.price)} />
              </dl>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="border-line bg-white shadow-[0_12px_35px_-15px_rgba(31,41,55,0.16)]">
              <CardContent className="py-7">
                <SectionHeading title="Inventory" />
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <InventoryItem label="Total copies" value={copiesQuery.isLoading ? "—" : copies.length} />
                  <InventoryItem label="Available copies" value={copiesQuery.isLoading ? "—" : availableCopies} tone="available" />
                  <InventoryItem label="Borrowed copies" value={copiesQuery.isLoading ? "—" : borrowedCopies} tone="borrowed" />
                  <InventoryItem label="Book status" value={book.status} />
                </div>
              </CardContent>
            </Card>

            <Card className="border-line bg-white shadow-[0_12px_35px_-15px_rgba(31,41,55,0.16)]">
              <CardContent className="py-7">
                <SectionHeading title="Additional information" />
                <dl className="mt-2">
                  <DetailItem label="Book ID" value={book.id} />
                  <DetailItem label="Created date" value={formatDate(book.createdAt)} />
                  <DetailItem label="Categories" value={categoriesQuery.isLoading ? "Loading..." : categories.map((category) => category.name).join(", ") || "Uncategorized"} />
                </dl>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionHeading({ title }: { title: string }) {
  return <h2 className="text-lg font-semibold tracking-tight text-ink">{title}</h2>;
}

function PageMessage({ message, error = false }: { message: string; error?: boolean }) {
  return (
    <div className="min-h-screen bg-cream p-6">
      <div className={`mx-auto max-w-6xl rounded-md px-4 py-3 text-sm ${error ? "border border-red-200 bg-red-50 text-red-600" : "text-muted"}`}>{message}</div>
    </div>
  );
}

function BookNotFound({ booksPath }: { booksPath: string }) {
  return (
    <div className="min-h-screen bg-cream p-6">
      <div className="mx-auto max-w-6xl">
        <p className="text-muted">This book could not be found.</p>
        <Link to={booksPath} className="mt-4 inline-block text-sm font-medium text-camel-dark hover:text-camel">Back to books</Link>
      </div>
    </div>
  );
}
