import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth.ts";
import { Paths } from "../../../config/paths/paths.ts";
import { useStations } from "../../../hooks/useStations.ts";

export function Location() {
    const { user } = useAuth();
    const navigate = useNavigate();

    // 1. Получаем данные через универсальный хук.
    // publicOnly: true заставляет хук использовать открытый эндпоинт /lockers/stations
    const { stations, isLoading } = useStations({ publicOnly: true });

    // 2. Успокаиваем TypeScript: гарантируем, что работаем с массивом
    const safeStations = Array.isArray(stations) ? stations : [];

    // 3. Состояние: храним только ID выбранной станции
    const [selectedId, setSelectedId] = useState<string | null>(null);

    // 4. Вычисляем текущую станцию для карты (Derived State).
    // Если ничего не выбрано, берем первую из списка активных.
    const currentStation = safeStations.find(s => s.stationId === selectedId) || safeStations[0] || null;

    const handleAction = (stationId: string) => {
        if (!user) {
            // Если гость — отправляем на страницу входа
            navigate(Paths.LOGIN);
        } else {
            // Если авторизован — отправляем в личный кабинет на страницу бронирования бокса
            navigate(`${Paths.USER}/stations/${stationId}`);
        }
    };

    if (isLoading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#64748b' }}>Loading Lockers Map...</div>
            </div>
        );
    }

    return (
        <div style={wrapperStyle}>
            <div style={containerStyle}>
                <h1 style={{ textAlign: 'center', marginBottom: '40px', fontSize: '36px', fontWeight: 800 }}>
                    Lockers Map
                </h1>

                <div style={layoutStyle}>
                    {/* Левая колонка: Список станций */}
                    <div style={listStyle}>
                        {safeStations.length === 0 ? (
                            <div style={{ textAlign: 'center', color: '#64748b', padding: '20px' }}>
                                No active stations available right now.
                            </div>
                        ) : (
                            safeStations.map((loc) => (
                                <div
                                    key={loc.stationId}
                                    onClick={() => setSelectedId(loc.stationId)}
                                    style={{
                                        ...listItem,
                                        ...(currentStation?.stationId === loc.stationId ? activeItem : {})
                                    }}
                                >

                                    <div style={{ fontWeight: 800, fontSize: '18px', color: '#1a1a1a' }}>
                                        {typeof loc.city === 'string' ? loc.city : (loc.city?.name || 'Unknown City')}
                                    </div>
                                    <div style={{ fontSize: '14px', color: '#666', margin: '5px 0' }}>
                                        {loc.address || 'Address not specified'}
                                    </div>

                                    <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#4CAF50' }}>
                                        Capacity: {loc._count?.lockers || 0} boxes
                                    </div>

                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleAction(loc.stationId);
                                        }}
                                        style={actionButtonStyle}
                                    >
                                        {user ? "View Station" : "Login to Book"}
                                    </button>
                                </div>
                            ))
                        )}
                    </div>


                    <div style={mapWrapper}>
                        {currentStation ? (
                            <iframe
                                key={currentStation.stationId}
                                title="map"
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}

                                src={`https://maps.google.com/maps?q=${currentStation.latitude},${currentStation.longitude}&z=15&output=embed`}
                            />
                        ) : (
                            <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                                Select a station to view on map
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}


const wrapperStyle: React.CSSProperties = { minHeight: "92vh", background: "#f8fafc", padding: "50px 20px" };
const containerStyle = { maxWidth: "1200px", margin: "0 auto", width: "100%" };
const layoutStyle = { display: "grid", gridTemplateColumns: "380px 1fr", gap: "30px", height: "650px" };
const listStyle = {
    background: "white",
    borderRadius: "24px",
    padding: "20px",
    overflowY: "auto" as const,
    boxShadow: "0 20px 40px rgba(0,0,0,0.05)",
    border: '1px solid #e2e8f0'
};
const listItem = {
    padding: "20px",
    borderRadius: "18px",
    cursor: "pointer",
    marginBottom: "15px",
    border: "1px solid #f1f5f9",
    transition: "0.2s ease-in-out"
};
const activeItem = {
    borderColor: "#4CAF50",
    background: "#f0fdf4",
    boxShadow: '0 4px 12px rgba(76, 175, 80, 0.12)'
};
const actionButtonStyle = {
    marginTop: "15px",
    width: "100%",
    padding: "12px",
    background: "#4CAF50",
    color: "white",
    border: "none",
    borderRadius: "12px",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: '14px'
};
const mapWrapper = {
    background: "white",
    borderRadius: "24px",
    overflow: "hidden",
    boxShadow: "0 20px 40px rgba(0,0,0,0.05)",
    border: '1px solid #e2e8f0'
};