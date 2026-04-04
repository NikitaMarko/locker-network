import { useAdminDashboard } from "../hooks/useAdminDashboard";

export function AdminDashboardPage() {
    const { stats, events, loading } = useAdminDashboard();

    if (loading) return <div>Загрузка...</div>;

    return (
        <div>
            <h1>Админ панель</h1>

            {/* Статистика */}
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "20px",
                marginTop: "20px"
            }}>
                <StatCard title="Пользователи" value={stats.users} />
                <StatCard title="Ячейки" value={stats.lockers} />
                <StatCard title="Свободные" value={stats.free} />
                <StatCard title="Занятые" value={stats.busy} />
                <StatCard title="Ошибки" value={stats.errors} />
            </div>

            {/* Последние события */}
            <h2 style={{ marginTop: "40px" }}>Последние события</h2>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                <tr style={{ background: "#eee" }}>
                    <th style={cell}>Время</th>
                    <th style={cell}>Тип</th>
                    <th style={cell}>Описание</th>
                </tr>
                </thead>
                <tbody>
                {events.map(ev => (
                    <tr key={ev.id}>
                        <td style={cell}>{ev.timestamp}</td>
                        <td style={cell}>{ev.type}</td>
                        <td style={cell}>{ev.message}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}

interface StatCardProps {
    title: string;
    value: number;
}

function StatCard({ title, value }: StatCardProps) {
    return (
        <div style={{
            padding: "20px",
            borderRadius: "8px",
            background: "#f5f5f5",
            border: "1px solid #ddd",
            textAlign: "center"
        }}>
            <h3>{title}</h3>
            <p style={{ fontSize: "24px", fontWeight: "bold" }}>{value}</p>
        </div>
    );
}

const cell = {
    border: "1px solid #ddd",
    padding: "8px 12px",
};
