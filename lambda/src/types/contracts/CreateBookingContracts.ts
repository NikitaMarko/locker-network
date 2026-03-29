export interface CreateBookingRequest {
  userId: string;
  lockerBoxId: string;
  expectedEndTime: string; 
  correlationId: string;
  requestId?: string;
}
 
// ─── Response: what Lambda returns ───
export interface CreateBookingResponse {
  statusCode: number;
  headers: { 'Content-Type': string };
  body: string; 
}
 
export interface CreateBookingBody {
  success: boolean;
  booking?: {
    bookingId: string;
    userId: string;
    lockerBoxId: string;
    status: string;
    startTime: string;
    expectedEndTime: string;
    totalPrice: string;
    correlationId: string;
  };
  error?: {
    code: CreateBookingErrorCode;
    message: string;
  };
}
 
export type CreateBookingErrorCode =
  | 'VALIDATION_ERROR'
  | 'LOCKER_NOT_FOUND'
  | 'LOCKER_UNAVAILABLE'
  | 'USER_NOT_FOUND'
  | 'DUPLICATE_REQUEST'
  | 'INTERNAL_ERROR';
 