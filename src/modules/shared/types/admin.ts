export interface AdminStats {
    users: number;
    lockers: number;
    free: number;
    busy: number;
    errors: number;
}

export interface AdminEvent {
    id: string;
    timestamp: string;
    type: string;
    message: string;
}
