export interface BorrowTransaction {
  id: number;
  userId: number;
  processedByUserId: number | null;
  borrowedAt: string;
  notes: string | null;
  createdAt: string;
}

export interface BorrowItem {
  id: number;
  borrowTransactionId: number;
  bookCopyId: number;
  borrowedAt: string;
  dueDate: string;
  returnedAt: string | null;
  status: string;
  renewalCount: number;
  conditionAtBorrow: string | null;
  conditionAtReturn: string | null;
}

export interface CreateTransactionPayload {
  userId: number;
  processedByUserId?: number | null;
  borrowedAt: string;
  notes?: string | null;
}

export interface CreateItemPayload {
  borrowTransactionId: number;
  bookCopyId: number;
  borrowedAt: string;
  dueDate: string;
  status: string;
  renewalCount: number;
  conditionAtBorrow?: string | null;
}

export interface UserSummary {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  membershipNumber: string;
  status: string;
}