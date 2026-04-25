import { apiClient } from './apiClient';

export const bookingsApi = {
    getMyBookings: async () => {
        const response = await apiClient.get('/bookings/my');
        return response.data?.data || response.data;
    }
};