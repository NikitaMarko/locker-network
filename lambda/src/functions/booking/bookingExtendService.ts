import { OperationStatus } from '../../types/contracts/OperationContracts';
import { BookingExtendCommand } from '../../types/contracts/BookingContracts';
import {
  getBooking,
  updateBookingStatus,
  updateLockerStatus,
  updateOperationStatus,
} from '../../db/dynamodb';
 
export const handleBookingExtend = async (command: BookingExtendCommand): Promise<void> => {
  const { operationId, payload } = command;
  const { bookingId, userId, expectedEndTime } = payload;
 
  console.log(JSON.stringify({
    action: 'BOOKING_EXTEND_STARTED',
    operationId,
    bookingId,
    userId,
    expectedEndTime,
  }));
 
  // 1. Read booking
  const booking = await getBooking(bookingId);
 
  if (!booking) {
    console.error(JSON.stringify({ action: 'BOOKING_EXTEND_NOT_FOUND', bookingId }));
    await updateOperationStatus(operationId, OperationStatus.FAILED, `Booking ${bookingId} not found`);
    return;
  }
 
  // 2. Check ownership
  if (booking.userId !== userId) {
    console.error(JSON.stringify({ action: 'BOOKING_EXTEND_WRONG_USER', bookingId, userId }));
    await updateOperationStatus(operationId, OperationStatus.FAILED, 'User does not own this booking');
    return;
  }
 
  // 3. Validate status — must be ACTIVE or EXPIRED
  const isActive = booking.status === 'ACTIVE';
  const isExpired = booking.status === 'EXPIRED';
 
  if (!isActive && !isExpired) {
    console.error(JSON.stringify({
      action: 'BOOKING_EXTEND_WRONG_STATUS',
      bookingId,
      status: booking.status,
    }));
    await updateOperationStatus(operationId, OperationStatus.FAILED, `Cannot extend booking with status ${booking.status}`);
    return;
  }
 
  // 4. Update booking
  await updateBookingStatus(bookingId, 'ACTIVE', {
    expectedEndTime,
    ttl: 0, // no auto-delete for active bookings
  });
 
  // 5. If expired, reactivate locker too
  if (isExpired) {
    await updateLockerStatus(booking.lockerBoxId, 'OCCUPIED');
  }
 
  // 6. Update operation
  await updateOperationStatus(operationId, OperationStatus.SUCCESS);
 
  console.log(JSON.stringify({
    action: 'BOOKING_EXTEND_SUCCESS',
    operationId,
    bookingId,
    newEndTime: expectedEndTime,
    wasExpired: isExpired,
  }));
};