
import {z} from "zod";

export const createCitySchema = z.object({
    body: z.object({
        code: z.string().min(2).max(4),
        name: z.string(),
    }),
});