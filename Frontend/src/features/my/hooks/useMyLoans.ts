import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { borrowingApi } from "@/api/borrowing.api";
import { booksApi } from "@/api/books.api";
import { bookCopiesApi } from "@/api/bookCopies.api";
import type { Book, BookCopy } from "@/types/book.types";
import type { BorrowItem } from "@/types/borrow.types";

export interface MyLoanRow {
  item: BorrowItem;
  book?: Book;
  copy?: BookCopy;
}

export function isLoanOverdue(item: BorrowItem) {
  return item.status === "Borrowed" && new Date(item.dueDate).getTime() < Date.now();
}

export function useMyLoans(userId: number | undefined) {
  const enabled = Boolean(userId);

  const transactionsQuery = useQuery({
    queryKey: ["my-borrow-transactions", userId],
    queryFn: () => borrowingApi.getUserTransactions(userId!),
    enabled,
    retry: false,
  });

  const itemsQuery = useQuery({
    queryKey: ["borrow-items", "all"],
    queryFn: () => borrowingApi.getItems(),
    enabled,
    retry: false,
  });

  const booksQuery = useQuery({
    queryKey: ["books", "all"],
    queryFn: () => booksApi.getAll({ page: 1, pageSize: 100 }).then((result) => result.items),
    enabled,
    retry: false,
  });

  const copiesQuery = useQuery({
    queryKey: ["book-copies"],
    queryFn: bookCopiesApi.getAll,
    enabled,
    retry: false,
  });

  const rows = useMemo<MyLoanRow[]>(() => {
    if (!userId || !transactionsQuery.data || !itemsQuery.data) return [];
    const transactionIds = new Set(transactionsQuery.data.map((transaction) => transaction.id));
    const bookById = new Map((booksQuery.data ?? []).map((book) => [book.id, book]));
    const copyById = new Map((copiesQuery.data ?? []).map((copy) => [copy.id, copy]));

    return itemsQuery.data
      .filter((item) => transactionIds.has(item.borrowTransactionId))
      .map((item) => {
        const copy = copyById.get(item.bookCopyId);
        const book = copy ? bookById.get(copy.bookId) : undefined;
        return { item, book, copy };
      })
      .sort((a, b) => new Date(a.item.dueDate).getTime() - new Date(b.item.dueDate).getTime());
  }, [userId, transactionsQuery.data, itemsQuery.data, booksQuery.data, copiesQuery.data]);

  const currentLoans = rows.filter((row) => row.item.status === "Borrowed");
  const overdueLoans = currentLoans.filter((row) => isLoanOverdue(row.item));
  const returnedLoans = rows.filter((row) => row.item.status === "Returned");

  return {
    rows,
    currentLoans,
    overdueLoans,
    returnedLoans,
    isLoading: transactionsQuery.isLoading || itemsQuery.isLoading || booksQuery.isLoading || copiesQuery.isLoading,
    isError: transactionsQuery.isError || itemsQuery.isError || booksQuery.isError || copiesQuery.isError,
    error:
      transactionsQuery.error ??
      itemsQuery.error ??
      booksQuery.error ??
      copiesQuery.error ??
      null,
  };
}