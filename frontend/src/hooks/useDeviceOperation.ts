import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { devicesApi, type DeviceOperationData } from '../api/devicesApi';

export function useDeviceOperation() {
    const [operationId, setOperationId] = useState<string | null>(null);
    const openMutation = useMutation({
        mutationFn: (bookingId: string) => devicesApi.openLocker(bookingId),
        onSuccess: (data) => {
            setOperationId(data.operationId);
        },
    });

    const closeMutation = useMutation({
        mutationFn: (bookingId: string) => devicesApi.closeLocker(bookingId),
        onSuccess: (data) => {
            setOperationId(data.operationId);
        },
    });

    const { data: operationData, error: pollError } = useQuery<DeviceOperationData>({
        queryKey: ['device-operation', operationId],
        queryFn: () => devicesApi.getOperationStatus(operationId!),
        enabled: !!operationId, // Запускаем запрос, только если есть ID
        refetchInterval: (query) => {
            const status = query.state.data?.status;

            if (status === 'SUCCESS' || status === 'FAILED') {
                return false;
            }
            return 2000;
        },
    });

    const resetOperation = () => setOperationId(null);

    const isWorking =
        openMutation.isPending ||
        closeMutation.isPending ||
        (operationData && (operationData.status === 'PENDING' || operationData.status === 'PROCESSING'));

    return {
        openLocker: openMutation.mutateAsync,
        closeLocker: closeMutation.mutateAsync,
        resetOperation,
        isWorking,
        operationData,
        error: openMutation.error || closeMutation.error || pollError,
    };
}