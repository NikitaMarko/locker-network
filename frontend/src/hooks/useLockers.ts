import { useMutation, useQueryClient } from "@tanstack/react-query";
import { lockersApi } from "../api/lockersApi";
import type { LockertechStatus } from "../types/index";

interface ChangeLockerStatusPayload {
    lockerBoxId: string;
    techStatus: LockertechStatus;
}

export function useLockers() {
    const qc = useQueryClient();

    const invalidateAll = () => {
        qc.invalidateQueries({ queryKey: ["lockers"] });
        qc.invalidateQueries({ queryKey: ["stations"] });
        qc.invalidateQueries({ queryKey: ["station-details"] });
    };

    const changeStatus = useMutation({
        mutationFn: ({ lockerBoxId, techStatus }: ChangeLockerStatusPayload) =>
            lockersApi.updateLockertechStatus(lockerBoxId, techStatus),

        onSuccess: invalidateAll,

        onError: (error) => {
            console.error("Locker status update failed", error);
        }
    });

    const setReady = (id: string) =>
        changeStatus.mutateAsync({ lockerBoxId: id, techStatus: "READY" });

    const activate = (id: string) =>
        changeStatus.mutateAsync({ lockerBoxId: id, techStatus: "ACTIVE" });

    const setMaintenance = (id: string) =>
        changeStatus.mutateAsync({ lockerBoxId: id, techStatus: "MAINTENANCE" });

    const setFaulty = (id: string) =>
        changeStatus.mutateAsync({ lockerBoxId: id, techStatus: "FAULTY" });

    const cancelBookingMutation = useMutation({
        mutationFn: (id: string) => lockersApi.cancelBooking(id),
        onSuccess: invalidateAll,
        onError: (e) => console.error("Cancel booking failed", e)
    });

    return {
        changeLockertechStatus: changeStatus.mutateAsync,
        isUpdating: changeStatus.isPending,

        setReady,
        activate,
        setMaintenance,
        setFaulty,
        cancelBooking: cancelBookingMutation.mutateAsync
    };
}
