export interface Setting {
  id: number;
  key: string;
  value: string;
  description?: string | null;
  updatedAt: string;
  updatedByUserId?: number | null;
}

export interface UpdateSettingPayload {
  value: string;
  description?: string | null;
}