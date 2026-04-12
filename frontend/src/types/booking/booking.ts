export interface Booking {
    bookingId: string;
    userId: string;
    lockerId: string;
    status: string;
    startTime: string;
    endTime: string;
    totalPrice: number;
    createdAt: string;
    updatedAt: string;
}