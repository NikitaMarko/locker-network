import { useQuery } from "@tanstack/react-query";
import { getAdminStats, getRecentEvents } from "../../../api/adminApi";
import type { AdminStats, AdminEvent } from "../../shared/types/admin";
import { USE_MOCK } from "../../../config/env";

export function useAdminDashboard() {
    const statsQuery = useQuery<AdminStats>({
        queryKey: ["admin-stats"],
        queryFn: getAdminStats,

        enabled: !USE_MOCK,
        refetchInterval: USE_MOCK ? false : 5000,
    });

    const eventsQuery = useQuery<AdminEvent[]>({
        queryKey: ["admin-events"],
        queryFn: getRecentEvents,

        enabled: !USE_MOCK,
        refetchInterval: USE_MOCK ? false : 5000,
    });

    return {
        stats: statsQuery.data ?? {
            users: 0,
            lockers: 0,
            free: 0,
            busy: 0,
            errors: 0,
        },
        events: eventsQuery.data ?? [],
        loading: statsQuery.isLoading || eventsQuery.isLoading,
    };
}