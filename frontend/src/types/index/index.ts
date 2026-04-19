// ================================
// STATION
// ================================
export type StationStatus =
    | "ACTIVE"
    | "INACTIVE"
    | "MAINTENANCE"
    | "READY";

// ================================
// LOCKER CORE TYPES (RAW FROM BACKEND)
// ================================

export type LockerSize = "S" | "M" | "L";

// как приходит с backend
export type LockerStatus =
    | "AVAILABLE"
    | "RESERVED"
    | "OCCUPIED"
    | "FAULTY"
    | "EXPIRED"
    | "INACTIVE"
    | "READY"
    | "ACTIVE"
    | "MAINTENANCE";

// ================================
// DOMAIN SPLIT TYPES (логическое разделение UI)
// ================================

// технический жизненный цикл (админ/оператор)
export type LockerTechnicalStatus =
    | "INACTIVE"
    | "READY"
    | "ACTIVE"
    | "MAINTENANCE"
    | "FAULTY";

// пользовательская доступность
export type LockerAvailabilityStatus =
    | "AVAILABLE"
    | "RESERVED"
    | "OCCUPIED"
    | "EXPIRED";

// ================================
// TYPE GUARDS (SAFE NARROWING)
// ================================

export function isTechnicalStatus(
    status: LockerStatus
): status is LockerTechnicalStatus {
    return (
        status === "INACTIVE" ||
        status === "READY" ||
        status === "ACTIVE" ||
        status === "MAINTENANCE" ||
        status === "FAULTY"
    );
}

export function isAvailabilityStatus(
    status: LockerStatus
): status is LockerAvailabilityStatus {
    return (
        status === "AVAILABLE" ||
        status === "RESERVED" ||
        status === "OCCUPIED" ||
        status === "EXPIRED"
    );
}

// ================================
// MAPPERS (ВАЖНО: исправлено TS2322)
// ================================

export function getTechnicalStatus(status: LockerStatus): LockerTechnicalStatus {
    if (isTechnicalStatus(status)) {
        return status;
    }

    // availability → считаем как ACTIVE в админ-логике
    return "ACTIVE";
}

export function getAvailabilityStatus(
    status: LockerStatus
): LockerAvailabilityStatus | null {
    if (isAvailabilityStatus(status)) {
        return status;
    }

    return null;
}

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

    // raw backend status (единственный источник правды)
    status: LockerStatus;

    // optional computed fields (UI layer)
    technicalStatus?: LockerTechnicalStatus;
    availabilityStatus?: LockerAvailabilityStatus | null;
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