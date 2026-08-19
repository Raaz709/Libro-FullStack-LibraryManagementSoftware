import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { borrowingApi } from "@/api/borrowing.api";
import { finesApi } from "@/api/fines.api";
import { favoritesApi } from "@/api/favorites.api";
import { notificationsApi } from "@/api/notifications.api";
import { booksApi } from "@/api/books.api";
import { bookCopiesApi } from "@/api/bookCopies.api";
import type { Book } from "@/types/book.types";
import type { BookCopy } from "@/types/book.types";
import type { BorrowItem } from "@/types/borrow.types";

export interface MemberLoanRow {
  item: BorrowItem;
  book?: Book;
  copy?: BookCopy;
}

export function isLoanOverdue(item: BorrowItem) {
  return item.status === "Borrowed" && new Date(item.dueDate).getTime() < Date.now();
}

export function useMemberDashboard(userId: number | undefined) {
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

  const finesQuery = useQuery({
    queryKey: ["my-fines", userId],
    queryFn: () => finesApi.getByUser(userId!),
    enabled,
    retry: false,
  });

  const favoritesQuery = useQuery({
    queryKey: ["favorites"],
    queryFn: favoritesApi.getMyFavorites,
    enabled,
    retry: false,
  });

  const unreadQuery = useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: async () => (await notificationsApi.getUnread()).length,
    enabled,
    retry: false,
  });

  const booksQuery = useQuery({
    queryKey: ["books"],
    queryFn: booksApi.getAll,
    enabled,
    retry: false,
  });

  const copiesQuery = useQuery({
    queryKey: ["book-copies"],
    queryFn: bookCopiesApi.getAll,
    enabled,
    retry: false,
  });

  const loanRows = useMemo<MemberLoanRow[]>(() => {
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
      });
  }, [userId, transactionsQuery.data, itemsQuery.data, booksQuery.data, copiesQuery.data]);

  const currentLoans = loanRows.filter((row) => row.item.status === "Borrowed");
  const overdueLoans = currentLoans.filter((row) => isLoanOverdue(row.item));
  const unpaidFines = finesQuery.data?.filter((fine) => fine.status === "Unpaid") ?? [];
  const unpaidTotal = unpaidFines.reduce((sum, fine) => sum + fine.amount, 0);

  const isLoading =
    transactionsQuery.isLoading || itemsQuery.isLoading || finesQuery.isLoading;
  const isError =
    transactionsQuery.isError || itemsQuery.isError || finesQuery.isError;

  return {
    currentLoans,
    overdueLoans,
    unpaidFines,
    unpaidTotal,
    favoritesCount: favoritesQuery.data?.length ?? 0,
    unreadCount: unreadQuery.data ?? 0,
    isLoading,
    isError,
    error:
      transactionsQuery.error ??
      itemsQuery.error ??
      finesQuery.error ??
      null,
  };
}