import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { stationsApi } from "../api/stationsApi";
import { lockersApi } from "../api/lockersApi";
import type { Station, StationStatus } from "../types/lockers/lockers.ts";

export function useStations() {
    const qc = useQueryClient();


    const query = useQuery<Station[]>({
        queryKey: ["stations"],
        queryFn: stationsApi.getAllStations,
    });

    const invalidate = () => qc.invalidateQueries({ queryKey: ["stations"] });


    const create = useMutation({
        mutationFn: async (payload: { city: string; address: string; latitude: number; longitude: number }) => {
            const response = await stationsApi.createStation(payload);
            return response;
        },
        onSuccess: invalidate,
    });

    const remove = useMutation({
        mutationFn: (id: string) => stationsApi.deleteStation(id),
        onSuccess: invalidate,
    });

    const updateStatus = useMutation({
        mutationFn: ({ id, status }: { id: string; status: StationStatus }) =>
            stationsApi.updateStationStatus(id, status),
        onSuccess: invalidate,
    });


    const book = useMutation({
        mutationFn: (lockerBoxId: string) => lockersApi.updateLockerStatus(lockerBoxId, "RESERVED"),
        onSuccess: () => {
            invalidate();
            qc.invalidateQueries({ queryKey: ["bookings-my"] });
        },
    });


    const cancel = useMutation({
        mutationFn: (lockerBoxId: string) => lockersApi.updateLockerStatus(lockerBoxId, "AVAILABLE"),
        onSuccess: () => {
            invalidate();
            qc.invalidateQueries({ queryKey: ["bookings-my"] });
        },
    });

    const addLockerMutation = useMutation({
        mutationFn: (payload: { stationId: string; code: string; size: 'S' | 'M' | 'L' }) =>
            stationsApi.addLocker(payload),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["station-details"] }),
    });

    return {
        stations: query.data ?? [],
        lockers: query.data?.flatMap(s => s.lockers || []) || [],
        isLoading: query.isLoading,
        deleteStation: remove.mutate,
        createStation: create.mutateAsync,
        updateStatus: updateStatus.mutate,
        bookLockerAsync: book.mutateAsync,
        cancelBooking: cancel.mutate,
        addLocker: addLockerMutation.mutateAsync,
        refresh: invalidate
    };
}