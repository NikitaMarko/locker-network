import { z } from "zod";
import { BookingStatus } from "@prisma/client";

import { LockerSizeEnum } from "./lockersSchema";

export const bookingInitSchema = z.object({
    body: z.object({
        stationId: z.string().uuid(),
        size: LockerSizeEnum,
        expectedEndTime: z.string().datetime(),
    }),
});

export const oneBookingSchema = z.object({
    params: z.object({
        id: z.string().uuid(),
    }),
});

export const BookingStatusEnum = z.nativeEnum(BookingStatus);

export const bookingStatusChangeSchema = z.object({
    params: z.object({
        id: z.string().uuid(),
    }),
    body: z.object({
        status: BookingStatusEnum,
    }),
});
