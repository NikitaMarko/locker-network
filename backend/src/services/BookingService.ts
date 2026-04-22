import {Request, Response} from "express";
import {v4 as uuidv4} from "uuid";

import {HttpError} from "../errorHandler/HttpError";
import {sendSuccess} from "../utils/response";
import {operationRepository} from "../repositories/operation/OperationRepository";
import {logAudit} from "../utils/audit";

import {getBooking} from "./dynamoService";
import {idempotencyService} from "./IdempotencyService";
import {ActionType, Operation, OperationStatus, OperationType} from "./dto/operationDto";
import {sendOperationToQueue} from "./sqsService";
import {prismaService} from "./prismaService";


export class BookingService {
    async initBooking(req: Request, res: Response) {
        return idempotencyService.execute(
            req,
            res,
            "booking-init",
            req.body,
            async () => {
                const {stationId, size, expectedEndTime} = req.body;
                const operationId = uuidv4();
                const operation: Operation = {
                    operationId,
                    userId: req.user?.userId,
                    timestamp: new Date().toISOString(),
                    status: OperationStatus.PENDING,
                    type: OperationType.BOOKING_INIT
                };

                try {
                    await operationRepository.create(operation);
                    await sendOperationToQueue({
                        operationId,
                        type: operation.type,
                        payload: {
                            timestamp: operation.timestamp,
                            userId: operation.userId,
                            stationId, size, expectedEndTime
                        }
                    });

                    await logAudit({
                        req,
                        action: ActionType.OPERATION_CREATE,
                        actorId: req.user?.userId,
                        entityId: operationId,
                        entityType: "Operation"
                    });

                    return {
                        body: {
                            operationId,
                            status: OperationStatus.PENDING,
                        }
                    };
                } catch (e) {
                    const errorMessage = e instanceof Error ? e.message : "Failed to create booking operation";

                    await operationRepository.updateStatus(operationId, OperationStatus.FAILED, errorMessage);
                    await logAudit({
                        req,
                        action: ActionType.OPERATION_CREATE_FAILED,
                        actorId: req.user?.userId,
                        entityId: operationId,
                        entityType: "Operation",
                        details: {reason: errorMessage}
                    });

                    throw new HttpError(500, errorMessage);
                }
            }
        );
    }


    async getBooking(req: Request, res: Response) {
        const booking = await getBooking(req.params.id as string);

        if (!booking) {
            throw new HttpError(404, "Booking not found");
        }

        return sendSuccess(res, booking);
    }

    async getAllBookingsAdmin(_req: Request, res: Response) {
        const result = await prismaService.booking.findMany();
        return sendSuccess(res, result);
    }

    async getBookingAdmin(req: Request, res: Response) {
        const bookingId = req.params.id as string;

        const result = await prismaService.booking.findUnique({
            where: {bookingId}
        });

        return sendSuccess(res, result);
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
