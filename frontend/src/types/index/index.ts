
export type StationStatus = "ACTIVE" | "INACTIVE" | "MAINTENANCE" | "READY";

export type LockerSize = "S" | "M" | "L";

export type LockerStatus = "AVAILABLE" | "RESERVED" | "OCCUPIED" | "FAULTY" | "EXPIRED" | "INACTIVE";

export interface City {
    code: string;
    name: string;
}

export interface LockerBox {
    lockerBoxId: string;
    stationId: string;
    code: string;
    size: LockerSize;
    status: LockerStatus;
}

export interface LockerStation {
    stationId: string;
    city: string | City;
    address: string | null;
    latitude: number;
    longitude: number;
    status: StationStatus;
    lockers: LockerBox[];
    _count?: {
        lockers: number;
    };
}