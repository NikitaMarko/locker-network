// ================================
// STATION
// ================================

export type StationStatus =
    | "ACTIVE"
    | "INACTIVE"
    | "MAINTENANCE"
    | "READY";

// ================================
// LOCKER TYPES (NEW MODEL)
// ================================

export type LockerSize = "S" | "M" | "L";

// статус для пользователя
export type LockerUserStatus =
    | "AVAILABLE"
    | "RESERVED"
    | "OCCUPIED"
    | "EXPIRED";

// технический статус (админ/оператор)
export type LockertechStatus =
    | "INACTIVE"
    | "READY"
    | "ACTIVE"
    | "MAINTENANCE"
    | "FAULTY";

// ================================
// ENTITIES
// ================================

export interface City {
    code: string;
    name: string;
}

export interface LockerBox {
    lockerBoxId: string;
    stationId: string;
    code: string;
    size: LockerSize;

    // РАЗДЕЛЕНИЕ СТАТУСОВ
    status: LockerUserStatus | null;
    techStatus: LockertechStatus;
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
