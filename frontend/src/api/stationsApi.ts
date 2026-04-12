import { apiClient } from "./apiClient";
import type {
    Station,
    StationStatus
} from "../types/lockers/lockers.ts";


export const stationsApi = {

    getAllStations: async (): Promise<Station[]> => {
        const { data } = await apiClient.get<Station[]>("/lockers/stations/all");
        return data;
    },


    getActiveStations: async (): Promise<Station[]> => {
        const { data } = await apiClient.get<Station[]>("/lockers/stations");
        return data;
    },

    addLocker: async (payload: { stationId: string; code: string; size: 'S' | 'M' | 'L' }): Promise<void> => {
        await apiClient.post(`/lockers/boxes`, payload);
    },

    getStationById: async (id: string): Promise<Station> => {
        const { data } = await apiClient.get<Station>(`/lockers/stations/${id}`);
        return data;
    },


    createStation: async (payload: { city: string; address: string; latitude: number; longitude: number }): Promise<any> => {
        const { data } = await apiClient.post("/lockers/stations", payload);
        return data;
    },


    updateStationStatus: async (id: string, status: StationStatus): Promise<Station> => {
        const { data } = await apiClient.patch<Station>(
            `/lockers/stations/${id}/status`,
            { status }
        );
        return data;
    },

    getUserStations: async (): Promise<Station[]> => {

        const { data } = await apiClient.get<Station[]>("/lockers/stations", {
            params: { status: 'ACTIVE' }
        });
        return data;
    },

    deleteStation: async (id: string): Promise<void> => {
        await apiClient.patch(`/lockers/stations/${id}/delete`);
    }
};