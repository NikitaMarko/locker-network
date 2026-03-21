import type { Role } from "../../../config/roles";

export interface User {
    userId: string;
    email: string;
    name: string;
    role: Role;
    phone?: string;
}
