import { OperationStatus } from '../../types/contracts/OperationContracts';
import { PaymentConfirmCommand } from '../../types/contracts/BookingContracts';
import {
  getBooking,
  updateBookingStatus,
  updateLockerStatus,
  updateOperationStatus,
} from '../../db/dynamodb';
 
export const handlePaymentConfirm = async (command: PaymentConfirmCommand): Promise<void> => {
  const { operationId, payload } = command;
  const { bookingId, paymentSessionId, providerPaymentId, amount, currency } = payload;
 
  console.log(JSON.stringify({
    action: 'PAYMENT_CONFIRM_STARTED',
    operationId,
    bookingId,
    paymentSessionId,
  }));
 
  // 1. Read booking
  const booking = await getBooking(bookingId);
 
  if (!booking) {
    console.error(JSON.stringify({ action: 'PAYMENT_CONFIRM_NOT_FOUND', bookingId }));
    await updateOperationStatus(operationId, OperationStatus.FAILED, `Booking ${bookingId} not found`);
    return;
  }
 
  // 2. Validate
  if (booking.status === 'ACTIVE') {
    console.log(JSON.stringify({ action: 'PAYMENT_CONFIRM_ALREADY_ACTIVE', bookingId }));
    await updateOperationStatus(operationId, OperationStatus.SUCCESS);
    return;
  }
 
  if (booking.status !== 'PENDING') {
    console.error(JSON.stringify({ action: 'PAYMENT_CONFIRM_WRONG_STATUS', bookingId, status: booking.status }));
    await updateOperationStatus(operationId, OperationStatus.FAILED, `Booking status is ${booking.status}, expected PENDING`);
    return;
  }
 
  // Check TTL
  const now = new Date();
  const expiresAt = new Date(booking.expiresAt);
  if (now > expiresAt) {
    console.error(JSON.stringify({ action: 'PAYMENT_CONFIRM_EXPIRED', bookingId, expiresAt: booking.expiresAt }));
    await updateOperationStatus(operationId, OperationStatus.FAILED, `Booking expired at ${booking.expiresAt}`);
    return;
  }
 
  // Check paymentSessionId match
  if (booking.paymentSessionId !== paymentSessionId) {
    console.error(JSON.stringify({
      action: 'PAYMENT_CONFIRM_SESSION_MISMATCH',
      bookingId,
      expected: booking.paymentSessionId,
      received: paymentSessionId,
    }));
    await updateOperationStatus(operationId, OperationStatus.FAILED, 'Payment session ID mismatch');
    return;
  }
 
  // 3. Activate booking — remove TTL so DynamoDB doesn't auto-delete
  await updateBookingStatus(bookingId, 'ACTIVE', {
    providerPaymentId,
    paidAmount: amount,
    paidCurrency: currency,
    paidAt: now.toISOString(),
    ttl: 0, // remove TTL
  });
 
  // 4. Update locker: RESERVED → OCCUPIED
  await updateLockerStatus(booking.lockerBoxId, 'OCCUPIED');
 
  // 5. Update operation
  await updateOperationStatus(operationId, OperationStatus.SUCCESS);
 
  console.log(JSON.stringify({
    action: 'PAYMENT_CONFIRM_SUCCESS',
    operationId,
    bookingId,
    lockerBoxId: booking.lockerBoxId,
  }));
};