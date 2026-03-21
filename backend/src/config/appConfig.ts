import {readFileSync} from "node:fs";
import path from "node:path";

import {env} from "./env";

export const PORT = env.PORT;
export const baseUrl = `http://localhost:${PORT}`;
export const db = env.DATABASE_URL!;

const jsonPath = path.resolve(__dirname, "./app-config", "app-config.json");
const appConf = JSON.parse(readFileSync(jsonPath, "utf-8"));

export interface AppConfig {
    port: number,
    skipRoutes: string[],
    pathRoles: Record<string, string[]>,
    checkIdRoutes: string[],
    jwt: {
        secret: string,
        exp: string | number
    },
    logLevel: string
}

export const configuration: AppConfig = {
    ...appConf,
    mongoUri: db || "dev db address",
    jwt: {
        secret: env.JWT_ACCESS_SECRET || "super-secret",
        exp: env.JWT_REFRESH_EXPIRES_IN || "7d"
    }
}