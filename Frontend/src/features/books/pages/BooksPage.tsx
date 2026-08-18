import { useQuery } from "@tanstack/react-query";
import { booksApi } from "@/api/books.api";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function BooksPage() {
  const {
    data: books,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["books"],
    queryFn: booksApi.getAll,
  });

  if (isLoading) {
    return <p className="p-6 text-muted-foreground">Loading books...</p>;
  }

  if (isError) {
    return (
      <p className="p-6 text-destructive">
        Failed to load books: {error.message}
      </p>
    );
  }

  if (!books || books.length === 0) {
    return <p className="p-6 text-muted-foreground">No books found.</p>;
  }

  return (
    <div className="p-6">
      <h1 className="mb-4 text-2xl font-semibold">Books</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {books.map((book) => (
          <Card key={book.id}>
            <CardHeader>
              <CardTitle>{book.title}</CardTitle>
              <CardDescription>{book.isbn}</CardDescription>
            </CardHeader>
            <CardContent>
              {book.subtitle && (
                <p className="text-sm text-muted-foreground">
                  {book.subtitle}
                </p>
              )}
              <Badge variant="outline">{book.status}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}