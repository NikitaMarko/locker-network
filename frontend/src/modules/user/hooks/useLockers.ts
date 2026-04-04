import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getLockers, bookLocker, releaseLocker } from "../../../api/lockersApi";

export function useLockers() {
    const queryClient = useQueryClient();

    const { data: lockers = [], isLoading } = useQuery({
        queryKey: ["lockers"],
        queryFn: getLockers,
        refetchInterval: 3000,
    });

    const bookMutation = useMutation({
        mutationFn: bookLocker,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["lockers"] }),
    });

    const releaseMutation = useMutation({
        mutationFn: releaseLocker,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["lockers"] }),
    });

    return {
        lockers,
        isLoading,
        bookLocker: (id: string) => bookMutation.mutate(id),
        releaseLocker: (id: string) => releaseMutation.mutate(id),
    };
}
