import { Logger } from "winston";

import {TokenPayload} from "../utils/jwt";

declare global {
    namespace Express {
        interface Request {
            user?: TokenPayload;
            correlationId?: string;
            log?: Logger;
            rateLimit?: {
                limit: number;
                used: number;
                remaining: number;
                resetTime?: Date;
            };
        }
    }
}
