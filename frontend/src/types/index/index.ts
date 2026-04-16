export type StationStatus = "ACTIVE" | "INACTIVE" | "MAINTENANCE" | "READY";

export type LockerSize = "S" | "M" | "L";

export type LockerStatus =
    | "AVAILABLE"    // свободен для брони
    | "RESERVED"     // забронирован
    | "OCCUPIED"     // занят (внутри посылка/используется)
    | "FAULTY"       // ошибка/неисправность
    | "EXPIRED"      // бронь истекла
    | "INACTIVE"     // создан, но не настроен (админ)
    | "READY"        // настроен, но не введён в эксплуатацию (оператор)
    | "ACTIVE"       // введён в эксплуатацию (админ)
    | "MAINTENANCE"; // на обслуживании (админ)

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
