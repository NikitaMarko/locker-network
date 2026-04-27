import { useMutation, useQueryClient } from "@tanstack/react-query";
import { lockersApi } from "../api/lockersApi";
import type { LockerTechnicalStatus } from "../types/index";

interface ChangeLockerStatusPayload {
    lockerBoxId: string;
    technicalStatus: LockerTechnicalStatus;
}

export function useLockers() {
    const qc = useQueryClient();

    const invalidateAll = () => {
        qc.invalidateQueries({ queryKey: ["lockers"] });
        qc.invalidateQueries({ queryKey: ["stations"] });
        qc.invalidateQueries({ queryKey: ["station-details"] });
    };

    const changeStatus = useMutation({
        mutationFn: ({ lockerBoxId, technicalStatus }: ChangeLockerStatusPayload) =>
            lockersApi.updateLockerTechnicalStatus(lockerBoxId, technicalStatus),

        onSuccess: invalidateAll,

        onError: (error) => {
            console.error("Locker status update failed", error);
        }
    });

    const setReady = (id: string) =>
        changeStatus.mutateAsync({ lockerBoxId: id, technicalStatus: "READY" });

    const activate = (id: string) =>
        changeStatus.mutateAsync({ lockerBoxId: id, technicalStatus: "ACTIVE" });

    const setMaintenance = (id: string) =>
        changeStatus.mutateAsync({ lockerBoxId: id, technicalStatus: "MAINTENANCE" });

    const setFaulty = (id: string) =>
        changeStatus.mutateAsync({ lockerBoxId: id, technicalStatus: "FAULTY" });

    const cancelBookingMutation = useMutation({
        mutationFn: (id: string) => lockersApi.cancelBooking(id),
        onSuccess: invalidateAll,
        onError: (e) => console.error("Cancel booking failed", e)
    });

    return {
        changeLockerTechnicalStatus: changeStatus.mutateAsync,
        isUpdating: changeStatus.isPending,

        setReady,
        activate,
        setMaintenance,
        setFaulty,
        cancelBooking: cancelBookingMutation.mutateAsync
    };
}