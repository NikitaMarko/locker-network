import { useState, useCallback } from 'react';
import { apiClient } from '../api/apiClient';

interface InitBookingPayload {
    stationId: string;
    size: string;
    expectedEndTime: string;
}

export function useBooking() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);


    const initBooking = async (payload: InitBookingPayload) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await apiClient.post('/bookings/init', payload);
            return response.data.data;
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to initialize booking');
            setIsLoading(false);
            throw err;
        }
    };

    const pollOperation = useCallback(async (operationId: string): Promise<any> => {
        const maxAttempts = 30;
        const intervalMs = 2000;

        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            try {
                const response = await apiClient.get(`/operations/${operationId}`);
                const { status, data } = response.data;

                if (status === 'SUCCESS') {
                    setIsLoading(false);
                    return data;
                }

                if (status === 'FAILED' || status === 'ERROR') {
                    throw new Error(response.data.error?.message || 'Operation failed on server');
                }

                await new Promise(resolve => setTimeout(resolve, intervalMs));
            } catch (err: any) {
                if (attempt === maxAttempts - 1) {
                    setIsLoading(false);
                    throw err;
                }
            }
        }

        setIsLoading(false);
        throw new Error('Polling timeout');
    }, []);


    const startBookingFlow = async (payload: InitBookingPayload) => {
        try {
            const initRes = await initBooking(payload);
            const opId = initRes.data?.operationId || initRes.operationId;

            if (opId) {
                const finalData = await pollOperation(opId);

                if (finalData.payment?.paymentUrl) {
                    window.location.href = finalData.payment.paymentUrl;
                } else {
                    throw new Error("No payment URL received from server");
                }
            } else {
                throw new Error("No operationId received");
            }
        } catch (err: any) {
            setIsLoading(false);
            setError(err.message || "Booking flow interrupted");
            console.error("Booking flow interrupted:", err);
        }
    };

    return {
        initBooking,
        pollOperation,
        startBookingFlow,
        isLoading,
        setIsLoading,
        error
    };
}