// ─── BOOKING_INIT: SQS command from frontend via API Gateway ───
export interface BookingInitCommand {
  type: 'BOOKING_INIT';
  operationId: string;
  userId: string;
  stationId: string;
  size: 'S' | 'M' | 'L';
  expectedEndTime: string;
}
 
// ─── PAYMENT_CONFIRM: SQS command from backend after Stripe webhook ───
export interface PaymentConfirmCommand {
  type: 'PAYMENT_CONFIRM';
  operationId: string;
  payload: {
    bookingId: string;
    paymentSessionId: string;
    providerPaymentId: string;
    amount: number;
    currency: string;
  };
}
 
// ─── BOOKING_EXTEND: SQS command from backend ───
export interface BookingExtendCommand {
  type: 'BOOKING_EXTEND';
  operationId: string;
  payload: {
    bookingId: string;
    userId: string;
    expectedEndTime: string;
  };
}
 
// ─── DynamoDB booking record ───
export interface BookingRecord {
  bookingId: string;
  operationId: string;
  userId: string;
  stationId: string;
  lockerBoxId: string;
  size: string;
  status: 'PENDING' | 'ACTIVE' | 'CANCELLED' | 'EXPIRED';
  expectedEndTime: string;
  expiresAt: string;
  ttl: number;
  price: number;
  currency: string;
  paymentProvider: string;
  paymentSessionId: string;
  paymentIntentId: string;
  paymentUrl: string;
  createdAt: string;
}
 
// ─── Operation result for BOOKING_INIT ───
export interface BookingInitResult {
  bookingStatus: string;
  expiresAt: string;
  price: number;
  currency: string;
  paymentUrl: string;
  paymentSessionId: string;
  paymentIntentId: string;
}