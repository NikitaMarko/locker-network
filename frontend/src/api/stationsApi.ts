import { apiClient } from "./apiClient";
import type { LockerStation, StationStatus } from "../types/index";

export interface ApiResponse<T> {
    success: boolean;
    correlationId?: string;
    data: T;
    meta?: any;
}

export const stationsApi = {

    // ===============================
    // ADMIN
    // ===============================

    getAllStations: async (): Promise<LockerStation[]> => {
        const { data } = await apiClient.get<ApiResponse<LockerStation[]>>(
            "/lockers/admin/stations"
        );
        return data.data;
    },

    getAdminStationById: async (id: string): Promise<LockerStation> => {
        const { data } = await apiClient.get<ApiResponse<LockerStation>>(
            `/lockers/admin/stations/${id}`
        );
        return data.data;
    },

    createStation: async (payload: {
        city: string;
        address: string;
        latitude: number;
        longitude: number;
    }): Promise<LockerStation> => {
        const { data } = await apiClient.post<ApiResponse<LockerStation>>(
            "/lockers/admin/stations",
            payload
        );
        return data.data;
    },

    // ✅ Админ управляет ТОЛЬКО статусом станции (не locker)
    updateStationStatusAdmin: async (
        id: string,
        status: Extract<StationStatus, "ACTIVE" | "MAINTENANCE">
    ): Promise<LockerStation> => {
        const { data } = await apiClient.patch<ApiResponse<LockerStation>>(
            `/lockers/admin/stations/${id}/status`,
            { status }
        );
        return data.data;
    },

    // ===============================
    // OPERATOR
    // ===============================

    // ❗ ВАЖНО: ЭТОГО эндпоинта НЕТ в твоем Postman
    // Если бэк не добавит — будет 404
    updateStationStatusOperator: async (
        id: string,
        status: Extract<StationStatus, "READY">
    ): Promise<LockerStation> => {
        const { data } = await apiClient.patch<ApiResponse<LockerStation>>(
            `/lockers/oper/stations/${id}/status`,
            { status }
        );
        return data.data;
    },

    deleteStation: async (id: string): Promise<void> => {
        await apiClient.patch(`/lockers/oper/stations/${id}/delete`);
    },

    // ===============================
    // PUBLIC / USER
    // ===============================

    getActiveStations: async (): Promise<LockerStation[]> => {
        const { data } = await apiClient.get<ApiResponse<LockerStation[]>>(
            "/lockers/stations",
            {
                params: { status: "ACTIVE" }
            }
        );
        return data.data;
    },

    getStationById: async (id: string): Promise<LockerStation> => {
        const { data } = await apiClient.get<ApiResponse<LockerStation>>(
            `/lockers/stations/${id}`
        );
        return data.data;
    },

    // ===============================
    // LOCKERS (через station)
    // ===============================

    // ✅ ВСЕ новые боксы = INACTIVE (логика на backend)
    addLocker: async (payload: {
        stationId: string;
        code: string;
        size: "S" | "M" | "L";
    }): Promise<any> => {
        const { data } = await apiClient.post<ApiResponse<any>>(
            `/lockers/admin/boxes`,
            payload
        );
        return data.data;
    }
};