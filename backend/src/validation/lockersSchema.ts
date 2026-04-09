import {z} from "zod";

export const LockerStatusEnum = z.enum([
    "AVAILABLE",
    "RESERVED",
    "OCCUPIED",
    "FAULTY",
    "EXPIRED"
]);

export const LockerSizeEnum = z.enum([
    "S",
    "M",
    "L"
]);

export const createLockerSchema = z.object({
    body: z.object({
        stationId: z.string().uuid(),
        code: z.string(),
        size: LockerSizeEnum,
    }),
});

export const getLockersWithParamsSchema = z.object({
    query: z.object({
        stationId: z.string().uuid().optional(),
        size: LockerSizeEnum.optional(),
        status: LockerStatusEnum.optional(),
    })
});

export const oneLockerSchema = z.object({
    params: z.object({
        id: z.string().uuid(),
    })
});

export const changeStatusLockerSchema = z.object({
    body: z.object({
        status: LockerStatusEnum,
    }),
    params: z.object({
        id: z.string().uuid(),
    })
});