import { useState } from 'react';
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

    const startBookingFlow = async (stationId: string, size: string, endTime: string) => {
        try {
            setIsLoading(true);
            setError(null);

            const bookingPayload = {
                stationId,
                size,
                expectedEndTime: endTime,
            };


            console.log(">>> [1] ИНИЦИАЛИЗАЦИЯ: POST /bookings/init");
            console.log("Payload:", bookingPayload);

            const response = await apiClient.post('/bookings/init', bookingPayload);

            console.log("<<< [2] ОТВЕТ НА ИНИЦИАЛИЗАЦИЮ:");
            console.dir(response.data);

            const operationId = response.data?.data?.operationId || response.data?.operationId;
            console.log(">>> [3] ВЫДЕЕННЫЙ OPERATION_ID:", operationId);

            if (!operationId) {
                console.error("КРИТИЧЕСКАЯ ОШИБКА: operationId не найден в ответе!");
                throw new Error("No operationId received");
            }

            pollOperation(operationId);

        } catch (err: any) {
            console.error("!!! ОШИБКА ИНИЦИАЛИЗАЦИИ:", err.response?.data || err.message);
            setError(err.message);
            setIsLoading(false);
        }
    };

    const pollOperation = async (operationId: string) => {
        let attempts = 0;
        const maxAttempts = 15;

        console.log(`>>> [4] ЗАПУСК ПУЛЛИНГА для ID: ${operationId}`);

        const interval = setInterval(async () => {
            try {
                attempts++;
                const pollUrl = `/operations/${operationId}`;
                console.log(`--- [Попытка ${attempts}] GET ${pollUrl}`);

                const response = await apiClient.get(pollUrl);

                console.log(`<<< [5] ДАННЫЕ ОПЕРАЦИИ (Попытка ${attempts}):`);
                console.log("Весь Response Data:", JSON.stringify(response.data, null, 2));


                const op = response.data?.data || response.data;
                console.log(`СТАТУС ИЗ ОТВЕТА: "${op?.status}" | ОЖИДАЕМ: "SUCCESS"`);

                if (op?.status === 'SUCCESS') {
                    console.log(" УСПЕХ! Статус совпал. Переходим к оплате...");
                    clearInterval(interval);

                    if (op.result?.paymentUrl || op.paymentUrl) {
                        const url = op.result?.paymentUrl || op.paymentUrl;
                        console.log(" URL ОПЛАТЫ:", url);
                        window.location.href = url;
                    } else {
                        console.error("ОШИБКА: Статус SUCCESS, но ссылки на оплату нет!");
                        setError("Payment URL missing");
                        setIsLoading(false);
                    }
                } else if (op?.status === 'FAILED') {
                    console.error(" ОПЕРАЦИЯ ПРОВАЛЕНА НА БЭКЕНДЕ:", op.errorMessage);
                    clearInterval(interval);
                    setError(op.errorMessage || "Operation failed");
                    setIsLoading(false);
                }

            } catch (err: any) {

                console.error(`!!! [ОШИБКА ПУЛЛИНГА на попытке ${attempts}]:`, {
                    status: err.response?.status,
                    data: err.response?.data,
                    message: err.message
                });

                if (err.response?.status === 401) {
                    console.error("ТОКЕН СТАЛ НЕВАЛИДНЫМ ВО ВРЕМЯ ПУЛЛИНГА");
                }

                clearInterval(interval);
                setError("Polling error");
                setIsLoading(false);
            }

            if (attempts >= maxAttempts) {
                console.warn(" ТАЙМАУТ ПУЛЛИНГА (10 попыток вышли)");
                clearInterval(interval);
                setError("Polling timeout");
                setIsLoading(false);
            }
        }, 2000);
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