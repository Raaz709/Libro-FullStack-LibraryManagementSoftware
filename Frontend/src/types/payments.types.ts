export interface Payment {
  id: number;
  fineId: number;
  userId: number;
  amount: number;
  paymentMethod: string;
  transactionReference: string | null;
  paidAt: string;
  processedByUserId: number | null;
}