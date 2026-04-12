import { useState } from "react";

export function Price() {
    const [hovered, setHovered] = useState<number | null>(null);

    return (
        <div style={wrapperStyle}>
            <div style={containerStyle}>

                <h1 style={titleStyle}>
                    Locker Pricing
                </h1>

                <p style={leadStyle}>
                    Choose the right locker size based on your needs. Simple and transparent pricing.
                </p>

                <div style={gridStyle}>
                    {lockers.map((locker, i) => (
                        <div
                            key={locker.size}
                            style={{
                                ...cardStyle,
                                ...(hovered === i ? cardHover : {})
                            }}
                            onMouseEnter={() => setHovered(i)}
                            onMouseLeave={() => setHovered(null)}
                        >
                            <h2 style={cardTitle}>{locker.size}</h2>

                            <div style={priceStyle}>
                                {locker.price}
                                <span style={unitStyle}> / hour</span>
                            </div>

                            <p style={descStyle}>
                                {locker.description}
                            </p>

                            <ul style={listStyle}>
                                {locker.features.map((f) => (
                                    <li key={f}>{f}</li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
}

/* ===== styles ===== */

const wrapperStyle = {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f6fa",
};

const containerStyle = {
    width: "100%",
    maxWidth: "900px",
};

/* HEADER */
const titleStyle = {
    textAlign: "center" as const,
    marginBottom: "100px",
};

const leadStyle = {
    textAlign: "center" as const,
    color: "#555",
    marginBottom: "30px",
};

/* GRID */
const gridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "24px",
};

/* CARD */
const cardStyle = {
    background: "white",
    padding: "24px 20px",
    borderRadius: "12px",
    boxShadow: "0 8px 20px rgba(0,0,0,0.05)",
    transition: "all 0.25s ease",
    border: "1px solid transparent",
    display: "flex",
    flexDirection: "column" as const,
    gap: "12px",
    cursor: "default",
};

const cardHover = {
    transform: "translateY(-6px)",
    boxShadow: "0 14px 30px rgba(0,0,0,0.12)",
    border: "1px solid #4CAF50",
};

/* CONTENT */
const cardTitle = {
    textAlign: "center" as const,
    fontSize: "20px",
    fontWeight: "600",
};

const priceStyle = {
    textAlign: "center" as const,
    fontSize: "26px",
    fontWeight: "bold",
    color: "#4CAF50",
};

const unitStyle = {
    fontSize: "14px",
    color: "#777",
};

const descStyle = {
    fontSize: "14px",
    color: "#555",
    textAlign: "center" as const,
    lineHeight: "1.5",
};

const listStyle = {
    paddingLeft: "18px",
    marginTop: "6px",
    lineHeight: "1.6",
    fontSize: "14px",
    color: "#444",
};

/* DATA */
const lockers = [
    {
        size: "S",
        price: "$2",
        description: "For small personal items",
        features: [
            "Phones, wallets, keys",
            "Quick access",
            "Lowest cost option",
        ],
    },
    {
        size: "M",
        price: "$4",
        description: "For everyday storage",
        features: [
            "Backpacks, small bags",
            "Best price / capacity balance",
            "Most popular choice",
        ],
    },
    {
        size: "L",
        price: "$6",
        description: "For larger items",
        features: [
            "Suitcases, equipment",
            "Maximum storage space",
            "Extended usage",
        ],
    },
];