import { User } from "../prisma";

declare global {
    namespace Express {
        interface Request {
            user?: User;
        }
    }
}