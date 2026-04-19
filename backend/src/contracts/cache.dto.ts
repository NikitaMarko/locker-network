import { LockerSize, LockerStatus, StationStatus, TechnicalStatus } from "@prisma/client";

export interface StationCacheLockerDto {
    lockerBoxId: string;
    stationId: string;
    code: string;
    size: LockerSize;
    status: LockerStatus | null;
    techStatus: TechnicalStatus;
    version: number;
    lastStatusChangedAt: string;
    pricePerHour: string | null;
}

export interface StationCacheDto {
    stationId: string;
    cityId: string;
    address: string | null;
    latitude: number;
    longitude: number;
    status: StationStatus;
    version: number;
    availableLockers: number;
    city: {
        code: string;
        name: string;
    };
    lockers: StationCacheLockerDto[];
}

export interface LockerCacheStationDto {
    address: string | null;
    latitude: number;
    longitude: number;
    status: StationStatus;
    city: {
        code: string;
        name: string;
    };
}

export interface LockerCacheDto {
    lockerBoxId: string;
    stationId: string;
    code: string;
    size: LockerSize;
    status: LockerStatus | null;
    techStatus: TechnicalStatus;
    version: number;
    lastStatusChangedAt: string;
    pricePerHour: string | null;
    station: LockerCacheStationDto;
}

export interface StationListItemDto {
    stationId: string;
    cityId: string;
    address: string | null;
    latitude: number;
    longitude: number;
    status: StationStatus;
    version: number;
    distance: number | null;
    city: {
        code: string;
        name: string;
    };
    _count: {
        lockers: number;
    };
}

export interface LockerResponseDto {
    lockerBoxId: string;
    stationId: string;
    code: string;
    size: LockerSize;
    status: LockerStatus | null;
    techStatus: TechnicalStatus;
    version: number;
    lastStatusChangedAt: string;
    pricePerHour: string | null;
    station: {
        address: string | null;
        city: string;
        latitude: number;
        longitude: number;
    };
}
