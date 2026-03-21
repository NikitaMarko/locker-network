import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    PORT: z.coerce.number().default(3555),
    DATABASE_URL: z.string().min(1, "DATABASE is required"),
    JWT_ACCESS_SECRET: z.string().min(1, "JWT_ACCESS_SECRET is required"),
    JWT_REFRESH_SECRET: z.string().min(1, "JWT_REFRESH_SECRET is required"),
    JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
    JWT_ACCESS_TOKEN_TTL: z.coerce.number().default(7),
    JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),
    JWT_REFRESH_TOKEN_TTL: z.coerce.number().default(7),
    FRONTEND_URL: z.string().url().optional(),
    SERVER_URL: z.string().url().optional(),
    LOG_LEVEL: z.string().default("info"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
    const formatted = parsed.error.flatten().fieldErrors;
    throw new Error(
        `Environment validation failed: ${JSON.stringify(formatted)}`
    );
}

export const env = parsed.data;
