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
        className={`h-full w-full object-contain transition-transform duration-500 group-hover:scale-105 ${compact ? "p-3" : "p-6"}`}
        onError={() => setImageFailed(true)}
      />
    );
  }

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-[#F6F6F2]">
      <div className="absolute inset-x-0 top-0 h-1.5 bg-[#FF7138]/40" />
      <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.5" className={`${compact ? "h-10 w-10" : "h-16 w-16"} relative text-[#8C8C8C]`} aria-hidden="true">
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
    return <p className={relaxed ? "text-xs font-semibold text-[#8C8C8C]" : "text-xs font-bold uppercase tracking-wider text-[#FF7138]"}>Loading author...</p>;
  }

  if (isError || !authors?.length) {
    return <p className={relaxed ? "text-xs font-semibold text-[#8C8C8C]" : "text-xs font-bold uppercase tracking-wider text-[#FF7138]"}>Author not listed</p>;
  }

  const firstAuthor = `${authors[0].firstName} ${authors[0].lastName}`.trim();
  const additionalAuthors = authors.length - 1;

  return (
    <p className={relaxed ? "text-xs font-semibold text-[#5F5F5F]" : "text-xs font-bold uppercase tracking-wider text-[#FF7138]"}>
      By {firstAuthor}{additionalAuthors > 0 ? ` +${additionalAuthors}` : ""}
    </p>
  );
}

function BookGridCard({ book }: { book: Book }) {
  return (
    <Link
      to={`/books/${book.id}`}
      className="group flex flex-col overflow-hidden rounded-[24px] border border-[#FF7138]/40 bg-white shadow-[0_4px_25px_rgba(0,0,0,0.06)] transition-all duration-300 hover:-translate-y-1 hover:border-[#FF7138] hover:shadow-[0_8px_30px_rgba(255,113,56,0.15)]"
    >
      <div className="h-48 border-b border-[#FF7138]/30 bg-[#F6F6F2]">
        <BookCover book={book} compact />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center justify-between gap-2 mb-2">
          <BookAuthorSummary bookId={book.id} />
          <Badge variant="outline" className="border-[#EEEEEA] bg-[#F6F6F2] text-[#202020] text-[11px] font-semibold">{book.status}</Badge>
        </div>
        <h2 className="line-clamp-2 text-base font-bold tracking-tight text-[#202020] transition-colors group-hover:text-[#FF7138]">{book.title}</h2>
        {book.subtitle && <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-[#5F5F5F]">{book.subtitle}</p>}
        
        <div className="mt-auto pt-4 mt-4 border-t border-[#FF7138]/20 flex items-center justify-between gap-3">
          <span className="text-xs font-mono font-medium text-[#8C8C8C]">ISBN: {book.isbn}</span>
          <span className="text-xs font-bold text-[#FF7138] group-hover:translate-x-0.5 transition-transform">View Details →</span>
        </div>
      </div>
    </Link>
  );
}

function BookListRow({ book }: { book: Book }) {
  return (
    <Link
      to={`/books/${book.id}`}
      className="group flex items-center gap-5 rounded-[20px] border border-[#FF7138]/40 bg-white p-4 shadow-[0_4px_20px_rgba(0,0,0,0.04)] transition-all duration-200 hover:border-[#FF7138] hover:shadow-[0_6px_25px_rgba(255,113,56,0.1)]"
    >
      <div className="h-24 w-18 shrink-0 overflow-hidden rounded-xl border border-[#FF7138]/30 bg-[#F6F6F2]">
        <BookCover book={book} compact />
      </div>
      <div className="min-w-0 flex-1 py-0.5">
        <div className="flex items-center justify-between gap-3 mb-1">
          <BookAuthorSummary bookId={book.id} relaxed />
          <Badge variant="outline" className="border-[#EEEEEA] bg-[#F6F6F2] text-[#202020] text-[11px] font-semibold">{book.status}</Badge>
        </div>
        <h2 className="text-base font-bold text-[#202020] group-hover:text-[#FF7138] transition-colors">{book.title}</h2>
        {book.subtitle && <p className="mt-0.5 line-clamp-1 text-xs text-[#5F5F5F]">{book.subtitle}</p>}

        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-[#8C8C8C]">
          <span className="rounded-lg bg-[#F6F6F2] px-2.5 py-1 font-mono">ISBN: {book.isbn}</span>
          {book.language && <span className="rounded-lg bg-[#F6F6F2] px-2.5 py-1">{book.language}</span>}
          {book.edition && <span className="rounded-lg bg-[#F6F6F2] px-2.5 py-1">{book.edition}</span>}
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
    <div className="min-h-screen bg-white">
      <div className="relative mx-auto max-w-7xl">
        <PageHeader
          eyebrow="Library"
          title="Books"
          description="Find and explore titles across your collection."
        >
          <p className="rounded-full border border-[#EEEEEA] bg-[#F6F6F2] px-3.5 py-1.5 text-xs font-semibold text-[#5F5F5F]">
            {totalResults} {totalResults === 1 ? "result" : "results"}
          </p>
        </PageHeader>

        <section className="mb-8 rounded-[24px] border border-[#FF7138]/30 bg-[#F6F6F2]/50 p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.6fr)_repeat(3,minmax(0,1fr))]">
            <Input
              value={search}
              onChange={(event) => { setSearch(event.target.value); resetPage(); }}
              placeholder="Search by title or ISBN"
              aria-label="Search books by title or ISBN"
              className="h-10 text-sm"
            />
            <Select value={sort} onChange={(event) => { setSort(event.target.value as SortOption); resetPage(); }} aria-label="Sort books">
              <option value="recent">Newest first</option>
              <option value="title">Title A–Z</option>
              <option value="status">Status</option>
            </Select>
          </div>

          <div className="mt-4 flex items-center justify-between gap-3 border-t border-[#FF7138]/20 pt-4">
            <Button variant="ghost" size="xs" onClick={clearFilters}>Clear filters</Button>
            <div className="rounded-xl border border-[#EEEEEA] bg-white p-1 shadow-sm">
              <ViewButton active={view === "grid"} onClick={() => setView("grid")}>Grid</ViewButton>
              <ViewButton active={view === "list"} onClick={() => setView("list")}>List</ViewButton>
            </div>
          </div>
        </section>

        {books.length === 0 ? (
          <PageState
            icon={<BookOpen className="h-7 w-7 text-[#8C8C8C]" />}
            title="No books match these filters."
            description="Try adjusting your search or filters."
            action={
              <Button variant="link" onClick={clearFilters}>Clear filters and show all books</Button>
            }
          />
        ) : view === "grid" ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">{books.map((book) => <BookGridCard key={book.id} book={book} />)}</div>
        ) : (
          <div className="space-y-4">{books.map((book) => <BookListRow key={book.id} book={book} />)}</div>
        )}

        {books.length > 0 && (
          <nav className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-[#EEEEEA] pt-6" aria-label="Book pagination">
            <p className="text-sm text-[#5F5F5F]">Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, totalResults)} of {totalResults}</p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}>Previous</Button>
              <span className="px-3 text-sm font-semibold text-[#202020]">Page {currentPage} of {totalPages}</span>
              <Button variant="outline" size="sm" disabled={currentPage === totalPages} onClick={() => setPage(currentPage + 1)}>Next</Button>
            </div>
          </nav>
        )}
      </div>
    </div>
  );
}

function ViewButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return <button type="button" onClick={onClick} className={cn("rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors", active ? "bg-[#FF7138] text-white shadow-sm" : "text-[#5F5F5F] hover:text-[#202020]")}>{children}</button>;
}

function PageMessage({ message, error = false, embedded = false }: { message: string; error?: boolean; embedded?: boolean }) {
  return <div className={cn(embedded ? "" : "min-h-screen bg-white p-6")}><div className={cn("mx-auto max-w-7xl rounded-xl px-4 py-3 text-sm", error ? "border border-red-200 bg-red-50 text-red-600" : "text-[#5F5F5F]")}>{message}</div></div>;
}
