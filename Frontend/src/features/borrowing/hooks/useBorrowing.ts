import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { borrowingApi } from "@/api/borrowing.api";
import type { CreateItemPayload, CreateTransactionPayload } from "@/types/borrow.types";

export function useBorrowingData() {
  return useQuery({
    queryKey: ["borrowing"],
    queryFn: async () => {
      const [transactions, items] = await Promise.all([
        borrowingApi.getTransactions(),
        borrowingApi.getItems(),
      ]);
      return { transactions, items };
    },
    retry: false,
  });
}

export function useCreateBorrow() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      transaction,
      item,
    }: {
      transaction: CreateTransactionPayload;
      item: CreateItemPayload;
    }) => {
      const createdTransaction = await borrowingApi.createTransaction(transaction);
      item.borrowTransactionId = createdTransaction.id;
      return borrowingApi.createItem(item);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["borrowing"] });
    },
  });
}

export function useRenewItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, newDueDate }: { id: number; newDueDate: string }) =>
      borrowingApi.renewItem(id, newDueDate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["borrowing"] });
    },
  });
}

export function useReturnItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, conditionAtReturn }: { id: number; conditionAtReturn?: string | null }) =>
      borrowingApi.returnItem(id, conditionAtReturn),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["borrowing"] });
      queryClient.invalidateQueries({ queryKey: ["book-copies"] });
    },
  });
}