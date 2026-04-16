import { apiClient } from "./apiClient";
import type { LockerStation, StationStatus } from "../types/index";


export interface ApiResponse<T> {
    success: boolean;
    correlationId?: string;
    data: T;
    meta?: any;
}

export const stationsApi = {

    // ADMIN/OPERATOR
    getAllStations: async (): Promise<LockerStation[]> => {
        const { data } = await apiClient.get<ApiResponse<LockerStation[]>>("/lockers/admin/stations");
        return data.data; // Распаковываем обертку
    },

    // PUBLIC
    getActiveStations: async (): Promise<LockerStation[]> => {
        const { data } = await apiClient.get<ApiResponse<LockerStation[]>>("/lockers/stations", {
            params: { status: 'ACTIVE' }
        });
        return data.data;
    },

    // USER
    getStationById: async (id: string): Promise<LockerStation> => {
        const { data } = await apiClient.get<ApiResponse<LockerStation>>(`/lockers/stations/${id}`);
        return data.data;
    },

    // ADMIN/OPERATOR
    createStation: async (payload: { city: string; address: string; latitude: number; longitude: number }): Promise<any> => {
        const { data } = await apiClient.post<ApiResponse<any>>("/lockers/admin/stations", payload);
        return data.data;
    },

    // ADMIN/OPERATOR
    updateStationStatus: async (id: string, status: StationStatus): Promise<LockerStation> => {
        const { data } = await apiClient.patch<ApiResponse<LockerStation>>(
            `/lockers/admin/stations/${id}/status`,
            { status }
        );
        return data.data;
    },

    // ADMIN/OPERATOR
    addLocker: async (payload: { stationId: string; code: string; size: 'S' | 'M' | 'L' }): Promise<any> => {
        const { data } = await apiClient.post<ApiResponse<any>>(`/lockers/admin/boxes`, payload);
        return data.data;
    },

    // OPERATOR
    deleteStation: async (id: string): Promise<any> => {
        const { data } = await apiClient.patch<ApiResponse<any>>(`/lockers/oper/stations/${id}/delete`);
        return data.data;
    }
};