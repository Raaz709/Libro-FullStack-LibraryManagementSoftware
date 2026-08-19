import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { favoritesApi } from "@/api/favorites.api";

export function useFavorites() {
  return useQuery({
    queryKey: ["favorites"],
    queryFn: favoritesApi.getMyFavorites,
    retry: false,
  });
}

export function useFavoriteStatus(bookId: number, enabled: boolean) {
  return useQuery({
    queryKey: ["favorites", bookId],
    queryFn: () => favoritesApi.isFavorite(bookId),
    enabled,
    retry: false,
  });
}

export function useFavoriteToggle(bookId: number, enabled: boolean) {
  const queryClient = useQueryClient();
  const { data: isFavorite = false } = useFavoriteStatus(bookId, enabled);
  const mutation = useMutation({
    mutationFn: (favorite: boolean) =>
      favorite ? favoritesApi.remove(bookId) : favoritesApi.add(bookId),
    onSuccess: (_data, favorite) => {
      queryClient.setQueryData(["favorites", bookId], !favorite);
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
    },
  });
  return {
    isFavorite,
    toggle: () => mutation.mutateAsync(isFavorite),
    isPending: mutation.isPending,
  };
}

export function useRemoveFavorite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (bookId: number) => favoritesApi.remove(bookId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
    },
  });
}