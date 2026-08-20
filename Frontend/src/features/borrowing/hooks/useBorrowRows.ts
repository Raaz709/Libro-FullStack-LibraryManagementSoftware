import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { usersApi } from "@/api/users.api";
import { booksApi } from "@/api/books.api";
import { bookCopiesApi } from "@/api/bookCopies.api";
import { useBorrowingData } from "@/features/borrowing/hooks/useBorrowing";
import type { Book } from "@/types/book.types";
import type { BookCopy } from "@/types/book.types";
import type { BorrowItem, UserSummary } from "@/types/borrow.types";

export interface BorrowRow {
  item: BorrowItem;
  user?: UserSummary;
  book?: Book;
  copy?: BookCopy;
}

export function isOverdue(item: BorrowItem) {
  return item.status === "Borrowed" && new Date(item.dueDate).getTime() < Date.now();
}

export function useBorrowRows() {
  const { data, isLoading, isError, error } = useBorrowingData();
  const { data: users = [] } = useQuery({
    queryKey: ["users"],
    queryFn: usersApi.getAll,
    retry: false,
  });
  const { data: books = [] } = useQuery({
    queryKey: ["books", "all"],
    queryFn: () => booksApi.getAll({ page: 1, pageSize: 100 }).then((result) => result.items),
    retry: false,
  });
  const { data: allCopies = [] } = useQuery({
    queryKey: ["book-copies"],
    queryFn: bookCopiesApi.getAll,
    retry: false,
  });

  const rows = useMemo(() => {
    const items = data?.items ?? [];
    const transactions = data?.transactions ?? [];
    const userById = new Map(users.map((u) => [u.id, u]));
    const bookById = new Map(books.map((b) => [b.id, b]));
    const copyById = new Map(allCopies.map((c) => [c.id, c]));
    const transactionById = new Map(transactions.map((t) => [t.id, t]));

    return items
      .map((item) => {
        const transaction = transactionById.get(item.borrowTransactionId);
        const copy = copyById.get(item.bookCopyId);
        const book = copy ? bookById.get(copy.bookId) : undefined;
        const user = transaction ? userById.get(transaction.userId) : undefined;
        return { item, user, book, copy };
      })
      .sort(
        (a, b) => new Date(a.item.dueDate).getTime() - new Date(b.item.dueDate).getTime(),
      );
  }, [data, users, books, allCopies]);

  return { rows, users, books, isLoading, isError, error };
}