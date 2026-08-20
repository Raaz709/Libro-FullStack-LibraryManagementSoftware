import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { permissionsApi } from "@/api/permissions.api";
import type { CreatePermissionPayload, RolePermissionPayload } from "@/types/permissions.types";

export function usePermissions() {
  return useQuery({
    queryKey: ["permissions"],
    queryFn: permissionsApi.getAll,
    retry: false,
  });
}

export function useRoles() {
  return useQuery({
    queryKey: ["permissions", "roles"],
    queryFn: permissionsApi.getRoles,
    retry: false,
  });
}

export function useCreatePermission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreatePermissionPayload) => permissionsApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["permissions"] });
    },
  });
}

export function useDeletePermission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (permissionId: number) => permissionsApi.delete(permissionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["permissions"] });
    },
  });
}

export function useToggleRolePermission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: RolePermissionPayload & { assign: boolean }) =>
      payload.assign
        ? permissionsApi.assign({ roleId: payload.roleId, permissionId: payload.permissionId })
        : permissionsApi.revoke({ roleId: payload.roleId, permissionId: payload.permissionId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["permissions"] });
    },
  });
}