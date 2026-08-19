import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { auditApi } from "@/api/audit.api";

export function useAuditLogs() {
  return useQuery({
    queryKey: ["audit-logs"],
    queryFn: auditApi.getAuditLogs,
    retry: false,
  });
}

export function useActivityLogs() {
  return useQuery({
    queryKey: ["activity-logs"],
    queryFn: auditApi.getActivityLogs,
    retry: false,
  });
}

export function useDeleteAuditLog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => auditApi.deleteAuditLog(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["audit-logs"] });
    },
  });
}

export function useDeleteActivityLog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => auditApi.deleteActivityLog(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activity-logs"] });
    },
  });
}