import type {Role} from "../../config/roles/roles.ts";
import type {Booking} from "../booking/booking.ts";

export interface User {
    userId: string;
    name: string;
    email: string;
    phone?: string;
    role: Role;
    passwordChangedAt?: string;
    createdAt: string;
    updatedAt: string;
    isDeleted: boolean;
    deletedAt?: string;
    bookings?: Booking[];
}