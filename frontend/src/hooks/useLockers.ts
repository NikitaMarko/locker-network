import { useMutation, useQueryClient } from "@tanstack/react-query";
import { lockersApi } from "../api/lockersApi";
import type { LockerStatus } from "../types/index";

interface ChangeLockerStatusPayload {
    lockerBoxId: string;
    status: LockerStatus;
}

export function useLockers() {
    const qc = useQueryClient();

    const invalidateAll = () => {
        qc.invalidateQueries({ queryKey: ["stations"] });
        qc.invalidateQueries({ queryKey: ["station-details"] });
        qc.invalidateQueries({ queryKey: ["operator-lockers"] });
        qc.invalidateQueries({ queryKey: ["user-lockers"] });
        qc.invalidateQueries({ queryKey: ["bookings-my"] });
    };

    // Универсальный метод смены статуса бокса
    const changeStatus = useMutation({
        mutationFn: ({ lockerBoxId, status }: ChangeLockerStatusPayload) =>
            lockersApi.updateLockerStatus(lockerBoxId, status),
        onSuccess: invalidateAll
    });

    // Бронирование (AVAILABLE → RESERVED)
    const reserve = useMutation({
        mutationFn: (lockerBoxId: string) =>
            lockersApi.updateLockerStatus(lockerBoxId, "RESERVED"),
        onSuccess: invalidateAll
    });

    // Отмена брони (RESERVED → AVAILABLE)
    const cancel = useMutation({
        mutationFn: (lockerBoxId: string) =>
            lockersApi.updateLockerStatus(lockerBoxId, "AVAILABLE"),
        onSuccess: invalidateAll
    });

    return {
        changeLockerStatus: changeStatus.mutateAsync,
        reserveLocker: reserve.mutateAsync,
        cancelBooking: cancel.mutateAsync
    };
}
