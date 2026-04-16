import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { stationsApi } from "../api/stationsApi";
import { lockersApi } from "../api/lockersApi";
import type { LockerStation, StationStatus } from "../types/index";

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

// ВЕРНУЛИ publicOnly, чтобы не было ошибки 403 у юзеров и гостей
export function useStations(options?: { publicOnly?: boolean }) {
    const qc = useQueryClient();
    const isPublic = options?.publicOnly;

    const query = useQuery<LockerStation[]>({
        queryKey: ["stations", isPublic ? "active" : "all"],
        queryFn: isPublic ? stationsApi.getActiveStations : stationsApi.getAllStations,
    });

    const invalidateAll = () => {
        qc.invalidateQueries({ queryKey: ["stations"] });
        qc.invalidateQueries({ queryKey: ["station-details"] });
        qc.invalidateQueries({ queryKey: ["operator-stations"] });
        qc.invalidateQueries({ queryKey: ["user-station"] });
        qc.invalidateQueries({ queryKey: ["bookings-my"] });
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

    // --- ВЕРНУЛИ ФУНКЦИИ БРОНИРОВАНИЯ ---
    const book = useMutation({
        mutationFn: (lockerBoxId: string) => lockersApi.updateLockerStatus(lockerBoxId, "RESERVED"),
        onSuccess: invalidateAll,
    });

    const cancel = useMutation({
        mutationFn: (lockerBoxId: string) => lockersApi.updateLockerStatus(lockerBoxId, "AVAILABLE"),
        onSuccess: invalidateAll,
    });

    return {
        stations: query.data ?? [],
        isLoading: query.isLoading,
        error: query.error,
        createStation: create.mutateAsync,
        deleteStation: remove.mutate,
        changeStationStatus: changeStatus.mutate,
        addLocker: addLocker.mutateAsync,

        bookLockerAsync: book.mutateAsync,
        cancelBooking: cancel.mutate,

        refresh: invalidateAll
    };
}