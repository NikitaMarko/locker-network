export type BookingInitRequestDto = {
    stationId: string;
    size: "S" | "M" | "L";
    expectedEndTime: string;
};

export type BookingInitOperationResultDto = {
    bookingId: string;
    lockerBoxId: string;
    bookingStatus: string;
    paymentStatus?: string;
    expiresAt: string;
    price: number;
    currency: string;
    payment: {
        provider: string;
        paymentSessionId: string;
        paymentIntentId: string;
        paymentUrl: string;
    };
};

export type BookingRecordDto = {
    bookingId: string;
    operationId?: string;
    userId: string;
    stationId: string;
    lockerBoxId: string;
    size: "S" | "M" | "L";
    status: string;
    paymentStatus?: string;
    expectedEndTime: string;
    expiresAt?: string;
    ttl?: number;
    price: number;
    currency: string;
    paymentProvider?: string;
    paymentSessionId?: string;
    paymentIntentId?: string;
    providerPaymentId?: string;
    paymentUrl?: string;
    amount?: number;
    paymentConfirmedAt?: string;
    startTime?: string;
    createdAt: string;
    updatedAt: string;
};
