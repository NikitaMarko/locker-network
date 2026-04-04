// src/modules/user/pages/LockerBookingPage.tsx

import { useState } from "react";
import { useLockers } from "../hooks/useLockers";
import { LockerCard } from "../components/LockerCard";
import type { Locker } from "../../shared/types/locker";

type FilterType = "all" | "free" | "busy" | "error";

export function LockerBookingPage() {
    const { lockers, isLoading } = useLockers();

    const [filter, setFilter] = useState<FilterType>("all");
    const [search, setSearch] = useState<string>("");

    if (isLoading) return <div>Загрузка...</div>;

    const filtered: Locker[] = lockers
        .filter((locker: Locker) => {
            if (filter === "free") return locker.status === "FREE";
            if (filter === "busy") return locker.status === "BUSY";
            if (filter === "error") return locker.status === "ERROR";
            return true;
        })
        .filter((locker: Locker) =>
            locker.number.toString().includes(search.trim())
        );

    return (
        <div>
            <h1>Бронирование ячеек</h1>

            {/* Фильтры */}
            <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
                <button onClick={() => setFilter("all")}>Все</button>
                <button onClick={() => setFilter("free")}>Свободные</button>
                <button onClick={() => setFilter("busy")}>Занятые</button>
                <button onClick={() => setFilter("error")}>С ошибками</button>
            </div>

            {/* Поиск */}
            <input
                type="text"
                placeholder="Поиск по номеру..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ marginBottom: "20px", padding: "8px", width: "200px" }}
            />

            {/* Список ячеек */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                    gap: "20px",
                }}
            >
                {filtered.map((locker: Locker) => (
                    <LockerCard key={locker.id} locker={locker} />
                ))}
            </div>
        </div>
    );
}
