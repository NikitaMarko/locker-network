import type { Locker } from "../../shared/types/locker";
import { useState } from "react";
import { useOperatorLockers } from "../hooks/useOperatorLockers";

export function LockerControlTable() {
    const {
        lockers,
        isLoading,
        openLocker,
        closeLocker,
        releaseLocker,
    } = useOperatorLockers();

    const [filter, setFilter] = useState("all");
    const [search, setSearch] = useState("");

    if (isLoading) return <div>Загрузка...</div>;

    const filtered = lockers
        .filter((locker) => {
            if (filter === "free") return locker.status === "FREE";
            if (filter === "busy") return locker.status === "BUSY";
            if (filter === "error") return locker.status === "ERROR";
            return true;
        })
        .filter((locker) =>
            locker.number.toString().includes(search.trim())
        );

    const getColor = (status: Locker["status"]) => {
        switch (status) {
            case "FREE": return "#d4ffd4";
            case "BUSY": return "#ffd4d4";
            case "ERROR": return "#ffe4b3";
            default: return "white";
        }
    };

    return (
        <div>
            <h2>Управление ячейками</h2>

            {/* Фильтры */}
            <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
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
                style={{ marginBottom: 20, padding: 8, width: 200 }}
            />

            <table style={{ width: "100%", marginTop: 20, borderCollapse: "collapse" }}>
                <thead>
                <tr>
                    <th style={cell}>ID</th>
                    <th style={cell}>Номер</th>
                    <th style={cell}>Статус</th>
                    <th style={cell}>Пользователь</th>
                    <th style={cell}>Действия</th>
                </tr>
                </thead>

                <tbody>
                {filtered.map((locker) => (
                    <tr key={locker.id} style={{ background: getColor(locker.status) }}>
                        <td style={cell}>{locker.id}</td>
                        <td style={cell}>{locker.number}</td>
                        <td style={cell}>{locker.status}</td>
                        <td style={cell}>{locker.userId || "-"}</td>

                        <td style={cell}>
                            <div style={{ display: "flex", gap: 8 }}>
                                <button onClick={() => openLocker(locker.id)}>
                                    Открыть
                                </button>

                                <button onClick={() => closeLocker(locker.id)}>
                                    Закрыть
                                </button>

                                {locker.status === "BUSY" && (
                                    <button onClick={() => releaseLocker(locker.id)}>
                                        Освободить
                                    </button>
                                )}
                            </div>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}

const cell = {
    border: "1px solid #ddd",
    padding: "8px 12px",
};
