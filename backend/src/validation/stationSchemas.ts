import { z } from "zod";

export const StationStatusEnum = z.enum([
    "ACTIVE",
    "INACTIVE",
    "MAINTENANCE",
]);

export const createStationSchema = z.object({
    body: z.object({
        city: z.string(),
        latitude: z.coerce.number().min(-90).max(90),
        longitude: z.coerce.number().min(-180).max(180),
        address: z.string().optional(),
    }),
});

export const getStationsWithParamsSchema = z.object({
    query: z.object({
        city: z.string().optional(),
        lat:z.string().optional(),
        lng:z.string().optional(),
        radius: z.string().optional(),
        status: StationStatusEnum.optional(),
    }).refine(
        (data) =>
            (!data.lat && !data.lng) ||
            (data.lat !== undefined && data.lng !== undefined),
        {
            message: "Both lat and lng must be provided together",
            path: ["lat"],
        }
    ),
});

export const oneStationSchema = z.object({
   params: z.object({
       id: z.string().uuid(),
   })
});

export const changeStatusStationSchema = z.object({
    body: z.object({
       status: StationStatusEnum,
    }),
    params: z.object({
        id: z.string().uuid(),
    })
});