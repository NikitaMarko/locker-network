import {useMutation, useQueryClient} from "@tanstack/react-query";
import {lockersApi} from "../api/lockersApi";
import type {LockerTechnicalStatus} from "../types/index";

interface ChangeLockerStatusPayload {
    lockerBoxId: string;
    status: LockerTechnicalStatus;
}

export function useLockers() {
    const qc = useQueryClient();

    const invalidateAll = () => {
        qc.invalidateQueries({queryKey: ["lockers"]});
        qc.invalidateQueries({queryKey: ["stations"]});
        qc.invalidateQueries({queryKey: ["station-details"]});
    };

    const changeStatus = useMutation({
        mutationFn: ({lockerBoxId, status}: ChangeLockerStatusPayload) =>
            lockersApi.updateLockerStatus(lockerBoxId, status),
        onSuccess: invalidateAll
    });

    // 🔥 бизнес-методы (очень важно)

    const setReady = (id: string) =>
        changeStatus.mutateAsync({lockerBoxId: id, status: "READY"});

    const activate = (id: string) =>
        changeStatus.mutateAsync({lockerBoxId: id, status: "ACTIVE"});

    const setMaintenance = (id: string) =>
        changeStatus.mutateAsync({lockerBoxId: id, status: "MAINTENANCE"});

    const setFaulty = (id: string) =>
        changeStatus.mutateAsync({lockerBoxId: id, status: "FAULTY"});

    return {
        changeLockerStatus: changeStatus.mutateAsync,

        // нормальные методы
        setReady,
        activate,
        setMaintenance,
        setFaulty
    };
}