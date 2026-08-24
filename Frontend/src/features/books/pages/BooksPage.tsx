import { type ReactNode, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { booksApi } from "@/api/books.api";
import { useAuthStore } from "@/store/authStore";
import type { Book } from "@/types/book.types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageState } from "@/components/ui/page-state";
import { BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS_PER_PAGE = 12;

type ViewMode = "grid" | "list";
type SortOption = "recent" | "title" | "status";

function BookCover({ book, compact = false }: { book: Book; compact?: boolean }) {
  const [imageFailed, setImageFailed] = useState(false);

  if (book.coverImageUrl && !imageFailed) {
    return (
      <img
        src={book.coverImageUrl}
        alt={`Cover of ${book.title}`}
        className={`h-full w-full object-contain transition-transform duration-500 group-hover:scale-105 ${compact ? "p-2" : "p-5"}`}
        onError={() => setImageFailed(true)}
      />
    );
  }

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-cream">
      <div className="absolute inset-x-0 top-0 h-1.5 bg-slate-200" />
      <div className="absolute -bottom-10 -right-10 h-32 w-32 rounded-full bg-cream/20" />
      <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.5" className={`${compact ? "h-8 w-8" : "h-14 w-14"} relative text-muted`} aria-hidden="true">
        <path d="M11 14.5A5.5 5.5 0 0 1 16.5 9H52v43H16.5A5.5 5.5 0 0 1 11 46.5v-32Z" />
        <path d="M16.5 9H52M16.5 30H52M20 18h24M20 23h17M20 39h24M20 44h14" />
      </svg>
    </div>
  );
}

function BookAuthorSummary({ bookId, relaxed = false }: { bookId: number; relaxed?: boolean }) {
  const { data: authors, isLoading, isError } = useQuery({
    queryKey: ["books", bookId, "authors"],
    queryFn: () => booksApi.getAuthors(bookId),
    retry: false,
  });

  if (isLoading) {
    return <p className={relaxed ? "text-sm text-muted" : "text-sm font-medium uppercase tracking-[0.14em] text-muted"}>Loading author...</p>;
  }

  if (isError || !authors?.length) {
    return <p className={relaxed ? "text-sm text-muted" : "text-sm font-medium uppercase tracking-[0.14em] text-muted"}>Author not listed</p>;
  }

  const firstAuthor = `${authors[0].firstName} ${authors[0].lastName}`.trim();
  const additionalAuthors = authors.length - 1;

  return (
    <p className={relaxed ? "truncate text-sm text-muted" : "truncate text-sm font-medium uppercase tracking-[0.14em] text-muted"}>
      By {firstAuthor}{additionalAuthors > 0 ? ` +${additionalAuthors}` : ""}
    </p>
  );
}

function BookGridCard({ book }: { book: Book }) {
  return (
    <Link
      to={`/books/${book.id}`}
      className="group overflow-hidden rounded-lg border border-line bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-camel"
    >
      <div className="h-48 border-b border-line bg-white/99"><BookCover book={book} compact /></div>
      <div className="flex min-h-48 flex-col p-4">
        <div className="flex items-center justify-between gap-3">
          <BookAuthorSummary bookId={book.id} />
          <Badge variant="outline" className="border-line bg-white text-slate-600">{book.status}</Badge>
        </div>
        <h2 className="mt-4 line-clamp-2 text-lg leading-relaxed font-semibold text-ink transition-colors group-hover:text-camel-dark">{book.title}</h2>
        {book.subtitle && <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted">{book.subtitle}</p>}
        <div className="mt-auto flex items-end justify-between gap-4 border-t border-line pt-4">
          <p className="truncate text-xs tracking-wide text-muted">ISBN {book.isbn}</p>
          <span className="shrink-0 text-sm font-medium text-muted transition-colors group-hover:text-camel">View →</span>
        </div>
      </div>
    </Link>
  );
}

function BookListRow({ book }: { book: Book }) {
  return (
    <Link
      to={`/books/${book.id}`}
      className="group flex items-start gap-5 rounded-lg border border-line bg-white p-5 shadow-sm transition-all duration-200 hover:border-camel"
    >
      <div className="h-28 w-20 shrink-0 overflow-hidden rounded-md border border-line bg-white"><BookCover book={book} compact /></div>
      <div className="min-w-0 flex-1 py-1">
        <div className="flex items-start justify-between gap-4">
          <BookAuthorSummary bookId={book.id} relaxed />
          <Badge variant="outline" className="shrink-0 border-line bg-white text-slate-600 sm:hidden">{book.status}</Badge>
        </div>
        <h2 className="mt-2 line-clamp-2 text-xl leading-relaxed font-semibold text-ink transition-colors group-hover:text-camel-dark">{book.title}</h2>
        {book.subtitle && <p className="mt-2 line-clamp-1 text-sm leading-6 text-muted">{book.subtitle}</p>}

        <div className="mt-5 flex flex-wrap gap-2">
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs tracking-wide text-slate-600">ISBN {book.isbn}</span>
          {book.language && <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-muted">{book.language}</span>}
          {book.edition && <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-muted">{book.edition}</span>}
        </div>
      </div>
    </Link>
  );
}

export default function BooksPage() {
  const token = useAuthStore((state) => state.token);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortOption>("recent");
  const [view, setView] = useState<ViewMode>("grid");
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["books", { search, sort, page }],
    queryFn: () =>
      booksApi.getAll({
        page,
        pageSize: ITEMS_PER_PAGE,
        search: search.trim() || undefined,
        sort,
      }),
    enabled: !!token,
    retry: false,
  });

  const books = data?.items ?? [];
  const totalResults = data?.total ?? 0;
  const totalPages = Math.max(1, data?.totalPages ?? 1);
  const currentPage = Math.min(page, totalPages);

  const resetPage = () => setPage(1);
  const clearFilters = () => {
    setSearch("");
    setSort("recent");
    resetPage();
  };

  if (isLoading) return <PageMessage message="Loading books..." />;
  if (isError) return <PageMessage message={`Failed to load books: ${error.message}`} error />;

  return (
    <div className="bg-cream min-h-screen p-6">
      <div className="absolute -left-32 -top-32 h-56 w-56 rounded-full bg-cream blur-3xl" />
      <div className="absolute -bottom-32 -right-32 h-56 w-56 rounded-full bg-cream/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl animate-in fade-in duration-500">
        <PageHeader
          eyebrow="Library"
          title="Books"
          description="Find and explore titles across your collection."
        >
          <p className="rounded-full border border-line bg-white/70 px-3 py-1.5 text-xs font-medium text-muted">
            {totalResults} {totalResults === 1 ? "result" : "results"}
          </p>
        </PageHeader>

        <section className="mb-8">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.6fr)_repeat(3,minmax(0,1fr))]">
            <Input
              value={search}
              onChange={(event) => { setSearch(event.target.value); resetPage(); }}
              placeholder="Search by title or ISBN"
              aria-label="Search books by title or ISBN"
              className="h-9 text-xs"
            />
            <Select value={sort} onChange={(event) => { setSort(event.target.value as SortOption); resetPage(); }} aria-label="Sort books">
              <option value="recent">Newest first</option>
              <option value="title">Title A–Z</option>
              <option value="status">Status</option>
            </Select>
          </div>

          <div className="mt-3 flex items-center justify-between gap-3 border-t border-line pt-3">
            <Button variant="ghost" size="xs" onClick={clearFilters}>Clear filters</Button>
            <div className="rounded-lg border border-line bg-white p-1">
              <ViewButton active={view === "grid"} onClick={() => setView("grid")}>Grid</ViewButton>
              <ViewButton active={view === "list"} onClick={() => setView("list")}>List</ViewButton>
            </div>
          </div>
        </section>

        {books.length === 0 ? (
          <PageState
            icon={<BookOpen className="h-7 w-7 text-muted" />}
            title="No books match these filters."
            description="Try adjusting your search or filters."
            action={
              <Button variant="link" onClick={clearFilters}>Clear filters and show all books</Button>
            }
          />
        ) : view === "grid" ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">{books.map((book) => <BookGridCard key={book.id} book={book} />)}</div>
        ) : (
          <div className="space-y-3">{books.map((book) => <BookListRow key={book.id} book={book} />)}</div>
        )}

        {books.length > 0 && (
          <nav className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5" aria-label="Book pagination">
            <p className="text-sm text-muted">Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, totalResults)} of {totalResults}</p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}>Previous</Button>
              <span className="px-2 text-sm font-medium text-slate-600">Page {currentPage} of {totalPages}</span>
              <Button variant="outline" size="sm" disabled={currentPage === totalPages} onClick={() => setPage(currentPage + 1)}>Next</Button>
            </div>
          </nav>
        )}
      </div>
    </div>
  );
}

function ViewButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return <button type="button" onClick={onClick} className={cn("rounded-lg px-3 py-1 text-xs font-semibold transition-colors", active ? "bg-white text-camel-dark shadow-sm" : "text-muted hover:text-camel")}>{children}</button>;
}

function PageMessage({ message, error = false, embedded = false }: { message: string; error?: boolean; embedded?: boolean }) {
  return <div className={cn(embedded ? "" : "min-h-screen bg-cream p-6")}><div className={cn("mx-auto max-w-7xl rounded-md px-4 py-3 text-sm", error ? "border border-line bg-cream text-slate-600" : "text-muted")}>{message}</div></div>;
}