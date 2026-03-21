import { useQuery } from '@tanstack/react-query';
import { getErrors } from '../../../api/errorsApi';

export function useErrors() {
    return useQuery({
        queryKey: ['errors'],
        queryFn: getErrors,
        refetchInterval: 3000, // обновление каждые 3 сек
    });
}
