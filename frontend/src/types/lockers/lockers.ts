
export type StationStatus = 'ACTIVE' | 'INACTIVE';
export type LockerStatus = 'AVAILABLE' | 'RESERVED' | 'OCCUPIED' | 'MAINTENANCE';
export type LockerSize = 'S' | 'M' | 'L' | 'XL';


export interface City {
    code: string;
    name: string;
}


export interface Station {
    stationId: string;
    cityId: string;
    address: string | null;
    latitude: number;
    longitude: number;
    status: StationStatus;
    city: City;

    _count?: {
        lockers: number;
    };
    lockers?: LockerBox[];
    createdAt: string;
    updatedAt: string;
    isDeleted: boolean;
}


export interface LockerBox {
    lockerBoxId: string;
    stationId: string;
    code: string;
    size: LockerSize;
    status: LockerStatus;
    pricePerHour?: string;
    lastStatusChangedAt: string;
    createdAt: string;
    updatedAt: string;
    isDeleted: boolean;
}


export interface CreateStationResponse {
    id: string;
    city: string;
}


export interface CreateLockerResponse {
    id: string;
    stationId: string;
}


export interface ApiErrorResponse {
    status: string;
    message: string;
}