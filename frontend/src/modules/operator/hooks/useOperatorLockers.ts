import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    getLockers,
    openLocker,
    closeLocker,
    releaseLocker,
    resetLockerError
} from "../../../api/lockersApi";
import type { Locker } from "../../shared/types/locker";

export function useOperatorLockers() {
    const queryClient = useQueryClient();

    const { data: lockers = [], isLoading } = useQuery<Locker[]>({
        queryKey: ["operator-lockers"],
        queryFn: getLockers,
        refetchInterval: 3000,
    });

    const openMutation = useMutation({
        mutationFn: openLocker,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["operator-lockers"] }),
    });

    const closeMutation = useMutation({
        mutationFn: closeLocker,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["operator-lockers"] }),
    });

    const releaseMutation = useMutation({
        mutationFn: releaseLocker,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["operator-lockers"] }),
    });

    const resetMutation = useMutation({
        mutationFn: resetLockerError,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["operator-lockers"] }),
    });

    return {
        lockers,
        isLoading,
        openLocker: (id: string) => openMutation.mutate(id),
        closeLocker: (id: string) => closeMutation.mutate(id),
        releaseLocker: (id: string) => releaseMutation.mutate(id),
        resetError: (id: string) => resetMutation.mutate(id),
    };
}
