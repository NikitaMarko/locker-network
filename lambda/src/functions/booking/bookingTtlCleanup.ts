import { DynamoDBStreamEvent } from 'aws-lambda';
import { updateLockerStatus } from '../../db/dynamodb';

export const handler = async (event: DynamoDBStreamEvent): Promise<void> => {
  for (const record of event.Records) {
    if (record.eventName !== 'REMOVE') continue;

    const oldImage = record.dynamodb?.OldImage;
    if (!oldImage) continue;

    const lockerBoxId = oldImage.lockerBoxId?.S;
    const status = oldImage.status?.S;
    const bookingId = oldImage.bookingId?.S;

    // Only release if booking was still PENDING (unpaid)
    if (status !== 'PENDING' || !lockerBoxId) continue;

    console.log(JSON.stringify({
      action: 'BOOKING_TTL_EXPIRED',
      bookingId,
      lockerBoxId,
      previousStatus: status,
    }));

    await updateLockerStatus(lockerBoxId, 'AVAILABLE');

    console.log(JSON.stringify({
      action: 'LOCKER_RELEASED',
      bookingId,
      lockerBoxId,
    }));
  }
};