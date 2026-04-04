//import { User } from "../prisma";
import {TokenPayload} from "../utils/jwt";

declare global {
    namespace Express {
        interface Request {
            user?: TokenPayload;
        }
    }
}