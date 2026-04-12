import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth.ts";
import { Paths } from "../../../config/paths/paths.ts";

export function Location() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [selected, setSelected] = useState(locations[0]);

    const handleAction = (locId: number) => {
        if (!user) {
            navigate(Paths.LOGIN);
        } else {
            navigate(`/stations/${locId}`);
        }
    };

    return (
        <div style={wrapperStyle}>
            <div style={containerStyle}>
                <h1 style={{ textAlign: 'center', marginBottom: '40px', fontSize: '36px', fontWeight: 800 }}>Lockers Map</h1>

                <div style={layoutStyle}>
                    <div style={listStyle}>
                        {locations.map((loc) => (
                            <div key={loc.id} onClick={() => setSelected(loc)}
                                 style={{ ...listItem, ...(selected.id === loc.id ? activeItem : {}) }}>
                                <div style={{ fontWeight: 800, fontSize: '18px', color: '#1a1a1a' }}>{loc.city}</div>
                                <div style={{ fontSize: '14px', color: '#666', margin: '5px 0' }}>{loc.address}</div>
                                <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#4CAF50' }}>Capacity: {loc.size}</div>

                                <button
                                    onClick={(e) => { e.stopPropagation(); handleAction(loc.id); }}
                                    style={actionButtonStyle}
                                >
                                    {user ? "View Station" : "Login to Book"}
                                </button>
                            </div>
                        ))}
                    </div>

                    <div style={mapWrapper}>
                        <iframe
                            key={selected.id}
                            title="map" width="100%" height="100%" style={{ border: 0 }}
                            src={`https://maps.google.com/maps?q=${encodeURIComponent(selected.address + " " + selected.city)}&output=embed`}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

const wrapperStyle: React.CSSProperties = { minHeight: "92vh", background: "#f8fafc", padding: "50px 20px" };
const containerStyle = { maxWidth: "1200px", margin: "0 auto", width: "100%" };
const layoutStyle = { display: "grid", gridTemplateColumns: "380px 1fr", gap: "30px", height: "650px" };
const listStyle = { background: "white", borderRadius: "24px", padding: "20px", overflowY: "auto" as const, boxShadow: "0 20px 40px rgba(0,0,0,0.05)", border: '1px solid #e2e8f0' };
const listItem = { padding: "20px", borderRadius: "18px", cursor: "pointer", marginBottom: "15px", border: "1px solid #f1f5f9", transition: "0.2s ease-in-out" };
const activeItem = { borderColor: "#4CAF50", background: "#f0fdf4", boxShadow: '0 4px 12px rgba(76, 175, 80, 0.12)' };
const actionButtonStyle = { marginTop: "15px", width: "100%", padding: "12px", background: "#4CAF50", color: "white", border: "none", borderRadius: "12px", cursor: "pointer", fontWeight: "bold", fontSize: '14px' };
const mapWrapper = { background: "white", borderRadius: "24px", overflow: "hidden", boxShadow: "0 20px 40px rgba(0,0,0,0.05)", border: '1px solid #e2e8f0' };

const locations = [
    { id: 1, city: "Tel Aviv", address: "Azrieli Center, 132 Begin Rd", size: "120 boxes" },
    { id: 2, city: "Jerusalem", address: "Malha Mall", size: "85 boxes" },
    { id: 3, city: "Haifa", address: "Grand Canyon Mall", size: "60 boxes" },
];