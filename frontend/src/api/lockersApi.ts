import { apiClient } from "./apiClient";
import type {
    LockerBox,
    LockerTechnicalStatus
} from "../types/index";

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
    getLockers: async (params?: { stationId?: string; size?: string; status?: string }): Promise<LockerBox[]> => {
        const { data } = await apiClient.get<ApiResponse<LockerBox[]>>("/lockers/boxes", { params });
        return data.data;
    },

    getLockerById: async (id: string): Promise<LockerBox> => {
        const { data } = await apiClient.get<ApiResponse<LockerBox>>(`/lockers/boxes/${id}`);
        return data.data;
    },

    // только technicalStatus
    updateLockerStatus: async (
        id: string,
        status: LockerTechnicalStatus
    ): Promise<LockerBox> => {
        const { data } = await apiClient.patch<ApiResponse<LockerBox>>(
            `/lockers/admin/boxes/${id}/status`,
            { technicalStatus: status }
        );
        return data.data;
    },

    getAdminLockers: async (): Promise<LockerBox[]> => {
        const { data } = await apiClient.get<ApiResponse<LockerBox[]>>("/lockers/admin/boxes");
        return data.data;
    },

    cancelBooking: async (bookingId: string) => {
        const response = await apiClient.post(`/bookings/${bookingId}/cancel`);
        return response.data;
    },

    deleteLocker: async (id: string): Promise<any> => {
        const { data } = await apiClient.patch<ApiResponse<any>>(
            `/lockers/oper/boxes/${id}/delete`
        );
        return data.data;
    }
};