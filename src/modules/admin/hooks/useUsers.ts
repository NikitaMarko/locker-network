import { useQuery } from '@tanstack/react-query';
import { getUsers } from '../../../api/usersApi';

export function useUsers() {
    return useQuery({
        queryKey: ['users'],
        queryFn: getUsers,
        refetchInterval: 3000, // обновление каждые 3 сек
    });
}
