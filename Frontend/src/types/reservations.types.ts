export interface Reservation {
  id: number;
  userId: number;
  bookId: number;
  status: "Waiting" | "Fulfilled" | "Cancelled";
  reservedAt: string;
  expiresAt: string | null;
  fulfilledAt: string | null;
  cancelledAt: string | null;
  bookTitle?: string | null;
  firstName?: string | null;
  lastName?: string | null;
}

export interface CreateReservationPayload {
  bookId: number;
}