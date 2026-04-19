import {z} from "zod";

export const LockerStatusEnum = z.enum([
    "AVAILABLE",
    "RESERVED",
    "OCCUPIED",
    "FAULTY",
    "EXPIRED"
]);

export const TechnicalStatusEnum = z.enum([
    "READY",
    "ACTIVE",
    "INACTIVE",
    "MAINTENANCE",
    "FAULTY"
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

export const changeTechStatusLockerSchema = z.object({
    body: z.object({
        techStatus: TechnicalStatusEnum,
    }),
    params: z.object({
        id: z.string().uuid(),
    })
});
