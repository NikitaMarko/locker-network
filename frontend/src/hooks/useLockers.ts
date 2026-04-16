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

    // Универсальная смена статуса бокса (используем для админа и оператора)
    const changeStatus = useMutation({
        mutationFn: ({ lockerBoxId, status }: ChangeLockerStatusPayload) =>
            lockersApi.updateLockerStatus(lockerBoxId, status),
        onSuccess: invalidateAll
    });

    // Бронирование (AVAILABLE → RESERVED) — пользователь
    const reserve = useMutation({
        mutationFn: (lockerBoxId: string) =>
            lockersApi.updateLockerStatus(lockerBoxId, "RESERVED"),
        onSuccess: invalidateAll
    });

    // Отмена брони (RESERVED → AVAILABLE) — пользователь
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
