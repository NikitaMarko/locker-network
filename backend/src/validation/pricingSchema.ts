import {z} from "zod";

export const LockerSizeEnum = z.enum([
    "S",
    "M",
    "L"
]);

export const createPriceSchema = z.object({
    body: z.object({
        cityId: z.string().uuid(),
        size: LockerSizeEnum,
        pricePerHour: z.number()
    }),
});

export const changePriceSchema = z.object({
    body: z.object({
        pricePerHour: z.number()
    }),
    params: z.object({
        id: z.string().uuid(),
    })
});