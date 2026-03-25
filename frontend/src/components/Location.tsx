import { useState } from "react";

export function Location() {
    const [selected, setSelected] = useState(locations[0]);

    return (
        <div style={wrapperStyle}>
            <div style={containerStyle}>

                <h1 style={titleStyle}>Our Locations</h1>

                <div style={layoutStyle}>

                    {/* LIST */}
                    <div style={listStyle}>
                        {locations.map((loc) => (
                            <div
                                key={loc.id}
                                onClick={() => setSelected(loc)}
                                style={{
                                    ...listItem,
                                    ...(selected.id === loc.id ? activeItem : {})
                                }}
                            >
                                <div style={itemTitle}>{loc.city}</div>
                                <div style={itemAddress}>{loc.address}</div>
                                <div style={itemSize}>Size: {loc.size}</div>
                            </div>
                        ))}
                    </div>

                    {/* MAP */}
                    <div style={mapWrapper}>
                        <iframe
                            key={selected.id}
                            title="map"
                            width="100%"
                            height="100%"
                            style={{ border: 0, borderRadius: "12px" }}
                            loading="lazy"
                            src={`https://www.google.com/maps?q=${selected.query}&output=embed`}
                        />
                    </div>

                </div>
            </div>
        </div>
    );
}
const locations = [
    {
        id: 1,
        city: "Tel Aviv",
        address: "Azrieli Center, 132 Begin Rd",
        query: "Azrieli Center Tel Aviv",
        size: "L"
    },
    {
        id: 2,
        city: "Jerusalem",
        address: "Malha Mall",
        query: "Malha Mall Jerusalem",
        size:"M"
    },
    {
        id: 3,
        city: "Haifa",
        address: "Grand Canyon Mall",
        query: "Grand Canyon Haifa",
        size:"S"
    },
];
const wrapperStyle = {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    backgroundColor: "#f5f6fa",
    padding: "40px 20px",
};

const containerStyle = {
    width: "100%",
    maxWidth: "1000px",
};

const titleStyle = {
    textAlign: "center" as const,
    marginBottom: "20px",
};

/* LAYOUT */
const layoutStyle = {
    display: "grid",
    gridTemplateColumns: "300px 1fr",
    gap: "20px",
    height: "500px",
};

/* LIST */
const listStyle = {
    background: "white",
    borderRadius: "12px",
    boxShadow: "0 8px 20px rgba(0,0,0,0.05)",
    padding: "10px",
    display: "flex",
    flexDirection: "column" as const,
    gap: "10px",
};

const listItem = {
    padding: "12px",
    borderRadius: "8px",
    cursor: "pointer",
    border: "1px solid transparent",
    transition: "all 0.2s ease",
};

const activeItem = {
    border: "1px solid #4CAF50",
    background: "#f0fdf4",
};

const itemTitle = {
    fontWeight: "bold",
};

const itemAddress = {
    fontSize: "13px",
    color: "#555",
};

const itemSize = {
    fontSize: "13px",
    color: "black",
};

/* MAP */
const mapWrapper = {
    background: "white",
    borderRadius: "12px",
    overflow: "hidden",
    boxShadow: "0 8px 20px rgba(0,0,0,0.05)",
};