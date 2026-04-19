import {Request, Response} from "express";

import {HttpError} from "../errorHandler/HttpError";
import {sendSuccess} from "../utils/response";

import {getBooking} from "./dynamoService";


export class BookingService {
    async initBooking(_req: Request, _res: Response) {
        throw new HttpError(501, "Booking init is not implemented yet");
        //return sendSuccess(res, result);
    }

    async getBooking(req: Request, res: Response) {
        const booking = await getBooking(req.params.id as string);

        if (!booking) {
            throw new HttpError(404, "Booking not found");
        }

        return sendSuccess(res, booking);
    }

    async getAllBookingsAdmin(_req: Request, res: Response) {
        throw new HttpError(501, "Get all bookings from admin are not implemented yet");
        //return sendSuccess(res, result);
    }

    async getBookingAdmin(req: Request, res: Response) {
        throw new HttpError(501, "Get booking from admin is not implemented yet");
        //return sendSuccess(res, result);
    }

    async updateBookingStatusAdmin(_req: Request, _res: Response) {
        throw new HttpError(501, "Booking status update is not implemented yet");
        //return sendSuccess(res, result);
    }

    async cancelBooking(_req: Request, _res: Response) {
        throw new HttpError(501, "Booking cancel is not implemented yet");
        //return sendSuccess(res, result);
    }
}

export const bookingService = new BookingService();
