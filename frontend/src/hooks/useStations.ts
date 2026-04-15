import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { stationsApi } from "../api/stationsApi";
import type { Station, StationStatus } from "../types/lockers/lockers";

interface ChangeStationStatusPayload {
    id: string;
    status: StationStatus;
}

interface CreateStationPayload {
    city: string;
    address: string;
    latitude: number;
    longitude: number;
}

export function useStations() {
    const qc = useQueryClient();

    const query = useQuery<Station[]>({
        queryKey: ["stations"],
        queryFn: stationsApi.getAllStations
    });

    const invalidateAll = () => {
        qc.invalidateQueries({ queryKey: ["stations"] });
        qc.invalidateQueries({ queryKey: ["station-details"] });
        qc.invalidateQueries({ queryKey: ["operator-stations"] });
        qc.invalidateQueries({ queryKey: ["user-station"] });
    };

    // Создание станции
    const create = useMutation({
        mutationFn: (payload: CreateStationPayload) =>
            stationsApi.createStation(payload),
        onSuccess: invalidateAll
    });

    // Удаление станции
    const remove = useMutation({
        mutationFn: (id: string) => stationsApi.deleteStation(id),
        onSuccess: invalidateAll
    });

    // Смена статуса станции
    const changeStatus = useMutation({
        mutationFn: ({ id, status }: ChangeStationStatusPayload) =>
            stationsApi.updateStationStatus(id, status),
        onSuccess: invalidateAll
    });

    // Добавление бокса к станции
    const addLocker = useMutation({
        mutationFn: (payload: { stationId: string; code: string; size: "S" | "M" | "L" }) =>
            stationsApi.addLocker(payload),
        onSuccess: invalidateAll
    });

    return {
        stations: query.data ?? [],
        isLoading: query.isLoading,

        createStation: create.mutateAsync,
        deleteStation: remove.mutate,
        changeStationStatus: changeStatus.mutate,
        addLocker: addLocker.mutateAsync,

        refresh: invalidateAll
    };
}
