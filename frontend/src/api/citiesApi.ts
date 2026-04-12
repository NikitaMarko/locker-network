import { apiClient } from './apiClient';

export interface City {
    cityId: string;
    code: string;
    name: string;
}

export const citiesApi = {
    getAllCities: async (): Promise<City[]> => {

        const { data } = await apiClient.get<City[]>("/cities");
        return data;
    }
};