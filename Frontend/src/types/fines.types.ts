export type FineStatus = "Unpaid" | "Paid" | "Waived";
export type FineType = "Overdue" | "Damage" | "Lost" | "Other";

export interface Fine {
  id: number;
  userId: number;
  borrowItemId: number | null;
  type: string;
  amount: number;
  reason: string | null;
  status: string;
  createdAt: string;
  waivedAt: string | null;
  waivedByUserId: number | null;
}

export interface CreateFinePayload {
  userId: number;
  borrowItemId?: number | null;
  type: string;
  amount: number;
  reason?: string | null;
  status: string;
}

export interface UpdateFinePayload {
  id: number;
  userId: number;
  borrowItemId?: number | null;
  type: string;
  amount: number;
  reason?: string | null;
  status: string;
}