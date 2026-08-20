export interface Permission {
  id: number;
  name: string;
  description?: string | null;
  assignedRoles?: string | null;
}

export interface RoleInfo {
  id: number;
  name: string;
}

export interface CreatePermissionPayload {
  name: string;
  description?: string | null;
}

export interface RolePermissionPayload {
  roleId: number;
  permissionId: number;
}