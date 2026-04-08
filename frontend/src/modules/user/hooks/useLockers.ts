import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getLockers, bookLocker, releaseLocker } from "../../../api/lockersApi";
import { USE_MOCK } from "../../../config/env";

export function useLockers() {
    const queryClient = useQueryClient();

    // MOCK данные
    const mockLockers = [
        { id: "1", location: "Tel Aviv", status: "FREE" },
        { id: "2", location: "Tel Aviv", status: "BUSY" },
    ];

    const { data: lockers = [], isLoading } = useQuery({
        queryKey: ["lockers"],
        queryFn: getLockers,
        enabled: !USE_MOCK,
        retry: false,
        refetchInterval: USE_MOCK ? false : 3000
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
        lockers: USE_MOCK ? mockLockers : lockers,
        isLoading,
        bookLocker: (id: string) => bookMutation.mutate(id),
        releaseLocker: (id: string) => releaseMutation.mutate(id),
    };
}