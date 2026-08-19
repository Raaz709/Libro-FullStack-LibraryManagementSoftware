export interface AuditLog {
  id: number;
  userId: number | null;
  action: string;
  entityType: string;
  entityId: number;
  oldValues: string | null;
  newValues: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}

export interface ActivityLog {
  id: number;
  userId: number | null;
  action: string | null;
  details: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string | null;
}