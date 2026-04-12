import { useState } from "react";

export function Info() {
    const [hovered, setHovered] = useState<number | null>(null);

    return (
        <div style={wrapperStyle}>
            <div style={containerStyle}>

                <h1 style={titleStyle}>
                    Smart Locker Network System
                </h1>

                <p style={leadStyle}>
                    A digital platform for booking and managing smart lockers across locations.
                </p>

                <div style={gridStyle}>

                    <div
                        style={{
                            ...cardStyle,
                            ...(hovered === 1 ? cardHover : {})
                        }}
                        onMouseEnter={() => setHovered(1)}
                        onMouseLeave={() => setHovered(null)}
                    >
                        <h3 style={{color:"#4CAF50"}}>About</h3>
                        <p>
                            Centralized system connecting multiple locker locations into a single network.
                        </p>
                    </div>

                    <div
                        style={{
                            ...cardStyle,
                            ...(hovered === 2 ? cardHover : {})
                        }}
                        onMouseEnter={() => setHovered(2)}
                        onMouseLeave={() => setHovered(null)}
                    >
                        <h3 style={{color:"#4CAF50"}}>Why it exists</h3>
                        <p>
                            Provides real-time availability, remote booking and controlled access.
                        </p>
                    </div>

                    <div
                        style={{
                            ...cardStyle,
                            ...(hovered === 3 ? cardHover : {})
                        }}
                        onMouseEnter={() => setHovered(3)}
                        onMouseLeave={() => setHovered(null)}
                    >
                        <h3 style={cardGreenText}>How it works</h3>
                        <ul style={listStyle}>
                            <li>Create account</li>
                            <li>Select locker</li>
                            <li>Book instantly</li>
                        </ul>
                    </div>
                </div>


            </div>
        </div>
    );
}

const cardGreenText = {
    color:"#4CAF50"
};
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
    gap: "20px",
    marginBottom: "25px",
};

/* CARDS */
const cardStyle = {
    background: "white",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 8px 20px rgba(0,0,0,0.05)",
    transition: "all 0.2s ease",
};

const cardHover = {
    transform: "translateY(-4px)",
    boxShadow: "0 12px 25px rgba(0,0,0,0.1)",
    border: "1px solid #4CAF50",
};

/* LIST */
const listStyle = {
    paddingLeft: "18px",
    marginTop: "10px",
    fontSize: "14px",
};