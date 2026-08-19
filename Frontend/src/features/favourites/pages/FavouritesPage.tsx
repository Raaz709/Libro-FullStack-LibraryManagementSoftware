import { useState } from "react";
import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import {
  useFavorites,
  useRemoveFavorite,
} from "@/features/favourites/hooks/useFavorites";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageState } from "@/components/ui/page-state";
import type { Book } from "@/types/book.types";

function BookCover({ book }: { book: Book }) {
  const [imageFailed, setImageFailed] = useState(false);

  if (book.coverImageUrl && !imageFailed) {
    return (
      <img
        src={book.coverImageUrl}
        alt={`Cover of ${book.title}`}
        className="h-full w-full object-contain p-5 transition-transform duration-500 group-hover:scale-105"
        onError={() => setImageFailed(true)}
      />
    );
  }

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-cream">
      <div className="absolute inset-x-0 top-0 h-1.5 bg-camel" />
      <div className="absolute -bottom-10 -right-10 h-32 w-32 rounded-full bg-camel/20" />
      <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.5" className="relative h-14 w-14 text-camel" aria-hidden="true">
        <path d="M11 14.5A5.5 5.5 0 0 1 16.5 9H52v43H16.5A5.5 5.5 0 0 1 11 46.5v-32Z" />
        <path d="M16.5 9H52M16.5 30H52M20 18h24M20 23h17M20 39h24M20 44h14" />
      </svg>
    </div>
  );
}

export default function FavouritesPage() {
  const { data: books = [], isLoading, isError, error } = useFavorites();
  const [search, setSearch] = useState("");

  const filteredBooks = books.filter((book) =>
    book.title.toLowerCase().includes(search.trim().toLowerCase()),
  );

  return (
    <div className="relative min-h-screen overflow-hidden bg-cream p-6 lg:p-8">
      <div className="absolute -left-32 -top-32 h-72 w-72 rounded-full bg-camel/20 blur-3xl" />
      <div className="absolute -bottom-32 -right-32 h-72 w-72 rounded-full bg-ink/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl animate-in fade-in duration-500">
        <PageHeader
          eyebrow="Library"
          title="Favorites"
          description="Books you have saved for later."
        >
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search favorites..."
            aria-label="Search favorites"
            className="h-9 w-64 text-xs"
          />
        </PageHeader>

        {isLoading ? (
          <p className="py-16 text-center text-sm text-muted">Loading favorites...</p>
        ) : isError ? (
          <p className="py-16 text-center text-sm text-red-600">Failed to load favorites: {(error as Error).message}</p>
        ) : filteredBooks.length === 0 ? (
          <PageState
            icon={<Heart className="h-7 w-7 text-camel" />}
            title={books.length === 0 ? "No favorites yet." : "No favorites match your search."}
            description={
              books.length === 0
                ? "Tap the heart on any book to save it here for later."
                : "Try adjusting your search."
            }
            action={
              books.length === 0 ? (
                <Link to="/books">
                  <Button>Browse books</Button>
                </Link>
              ) : undefined
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {filteredBooks.map((book) => (
              <FavouriteCard key={book.id} book={book} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function FavouriteCard({ book }: { book: Book }) {
  const removeFavorite = useRemoveFavorite();
  const [removing, setRemoving] = useState(false);

  return (
    <div className="group overflow-hidden rounded-card border border-line bg-card shadow-[0_12px_35px_-15px_rgba(31,41,55,0.16)] transition-all duration-300 hover:-translate-y-1 hover:border-camel hover:shadow-[0_20px_45px_-18px_rgba(154,119,60,0.28)]">
      <Link to={`/books/${book.id}`} className="block">
        <div className="h-52 border-b border-line bg-cream">
          <BookCover book={book} />
        </div>
      </Link>
      <div className="flex min-h-52 flex-col p-6">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-camel">
            {book.status}
          </span>
          <Badge variant="outline" className="border-camel bg-cream text-camel-dark">
            ISBN {book.isbn}
          </Badge>
        </div>
        <Link to={`/books/${book.id}`}>
          <h2 className="mt-4 line-clamp-2 text-xl leading-7 font-semibold tracking-tight text-ink transition-colors group-hover:text-camel-dark">
            {book.title}
          </h2>
        </Link>
        {book.subtitle && (
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted">{book.subtitle}</p>
        )}
        <div className="mt-auto flex items-center justify-between border-t border-line-soft pt-4">
          <Link
            to={`/books/${book.id}`}
            className="text-sm font-medium text-camel transition-colors hover:text-camel-dark"
          >
            View details →
          </Link>
          <Button
            variant="outline"
            size="xs"
            className="text-red-600 hover:text-red-600"
            disabled={removing}
            onClick={async () => {
              setRemoving(true);
              try {
                await removeFavorite.mutateAsync(book.id);
              } finally {
                setRemoving(false);
              }
            }}
          >
            <Heart className="mr-1 h-3 w-3 fill-red-600" />
            {removing ? "Removing..." : "Remove"}
          </Button>
        </div>
      </div>
    </div>
  );
}