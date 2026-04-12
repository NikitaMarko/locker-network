import { apiClient } from "./apiClient";
import type {
    LockerBox,
    LockerSize,
    LockerStatus,
    CreateLockerResponse
} from "../types/lockers/lockers.ts";


export const lockersApi = {

    getAllLockers: async (): Promise<LockerBox[]> => {
        const { data } = await apiClient.get<LockerBox[]>("/lockers/");
        return data;
    },


    createLocker: async (payload: {
        stationId: string;
        code: string;
        size: LockerSize;
    }): Promise<CreateLockerResponse> => {
        const { data } = await apiClient.post<CreateLockerResponse>(
            "/lockers/boxes",
            payload
        );
        return data;
    },


    updateLockerStatus: async (id: string, status: LockerStatus): Promise<LockerBox> => {
        const { data } = await apiClient.patch<LockerBox>(
            `/lockers/boxes/${id}/status`,
            { status }
        );
        return data;
    },


    deleteLocker: async (id: string): Promise<void> => {
        await apiClient.patch(`/lockers/boxes/${id}/delete`);
    }
};