import { apiClient } from "./apiClient";
import type { LockerBox, LockerStatus } from "../types/index";


export interface ApiResponse<T> {
    success: boolean;
    correlationId?: string;
    data: T;
    error?: {
        code: string;
        message: string;
    };
}

export const lockersApi = {
    /**
     * PUBLIC: Получить список боксов (фильтрация по stationId, size, status)
     */
    getLockers: async (params?: { stationId?: string; size?: string; status?: string }): Promise<LockerBox[]> => {
        const { data } = await apiClient.get<ApiResponse<LockerBox[]>>("/lockers/boxes", { params });
        return data.data;
    },

    /**
     * USER: Получить данные конкретного бокса по ID
     */
    getLockerById: async (id: string): Promise<LockerBox> => {
        const { data } = await apiClient.get<ApiResponse<LockerBox>>(`/lockers/boxes/${id}`);
        return data.data;
    },

    /**
     * ADMIN/OPERATOR: Смена статуса бокса (бронирование, активация и т.д.)
     * Используется в хуках для reserveLocker и cancelBooking
     */
    updateLockerStatus: async (id: string, status: LockerStatus): Promise<LockerBox> => {
        const { data } = await apiClient.patch<ApiResponse<LockerBox>>(
            `/lockers/admin/boxes/${id}/status`,
            { status }
        );
        return data.data;
    },

    /**
     * ADMIN/OPERATOR: Получить список всех боксов (из RDS)
     */
    getAdminLockers: async (): Promise<LockerBox[]> => {
        const { data } = await apiClient.get<ApiResponse<LockerBox[]>>("/lockers/admin/boxes");
        return data.data;
    },

    /**
     * OPERATOR: Мягкое удаление бокса
     */
    deleteLocker: async (id: string): Promise<any> => {
        const { data } = await apiClient.patch<ApiResponse<any>>(`/lockers/oper/boxes/${id}/delete`);
        return data.data;
    }
};