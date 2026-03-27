import { useState } from "react";

type Locker = {
    id: string;
    number: number;
    status: "FREE" | "BUSY" | "ERROR";
    userId?: string;
};

export function LockerControlTable({
                                       lockers,
                                       openLocker,
                                       closeLocker,
                                       releaseLocker,
                                   }: {
    lockers: Locker[];
    openLocker: (id: string) => void;
    closeLocker: (id: string) => void;
    releaseLocker: (id: string) => void;
}) {
    const [filter, setFilter] = useState("all");
    const [search, setSearch] = useState("");

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
            <h2>Locker Management</h2>

            {/* Filters */}
            <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
                <button onClick={() => setFilter("all")}>All</button>
                <button onClick={() => setFilter("free")}>Free</button>
                <button onClick={() => setFilter("busy")}>Busy</button>
                <button onClick={() => setFilter("error")}>Error</button>
            </div>

            {/* Search */}
            <input
                type="text"
                placeholder="Search by number..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ marginBottom: 20, padding: 8, width: 200 }}
            />

            <table style={{ width: "100%", marginTop: 20, borderCollapse: "collapse" }}>
                <thead>
                <tr>
                    <th style={cell}>ID</th>
                    <th style={cell}>Number</th>
                    <th style={cell}>Status</th>
                    <th style={cell}>User</th>
                    <th style={cell}>Actions</th>
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
                                    Open
                                </button>

                                <button onClick={() => closeLocker(locker.id)}>
                                    Close
                                </button>

                                {locker.status === "BUSY" && (
                                    <button onClick={() => releaseLocker(locker.id)}>
                                        Release
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