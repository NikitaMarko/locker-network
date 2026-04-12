export type StationStatus = "ACTIVE" | "INACTIVE" | "MAINTENANCE";
export type LockerSize = "S" | "M" | "L";
export type LockerStatus = "AVAILABLE" | "RESERVED" | "OCCUPIED" | "FAULTY" | "EXPIRED";


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
    city: string;
    address: string | null;
    latitude: number;
    longitude: number;
    status: StationStatus;
    lockers: LockerBox[];
}