import { Link } from 'react-router-dom';
import { useAuth } from '../../../app/providers/useAuth';
import { useState } from 'react';
import bg from '/smart-locker-project.jpeg';
import {Paths} from "../../../app/utils/paths.ts";

export function HomePageTest() {
    const { user } = useAuth();

    const [health, setHealth] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const handleHealthCheck = async () => {
        try {
            setLoading(true);

            const res = await fetch('http://localhost:3555/health');
            const data = await res.json();

            setHealth(data);
        } catch (err) {
            console.error(err);
            setHealth({
                status: 'DOWN',
                message: 'Server unreachable'
            });
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = () => {
        if (!health?.status) return 'white';

        switch (health.status) {
            case 'UP':
                return 'lightgreen';
            case 'DOWN':
                return 'red';
            default:
                return 'orange';
        }
    };

    const buttonStyle = {
        padding: "12px 24px",
        fontSize: "16px",
        borderRadius: "8px",
        border: "none",
        cursor: "pointer",
        backgroundColor: "#4CAF50",
        color: "white",
        textDecoration: "none",
        whiteSpace: "nowrap",
    };

    return (
        <div
            style={{
                height: "100vh",
                width: "100%",
                overflow: "hidden",
                backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(${bg})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",

                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "flex-start",

                fontFamily: "Arial, sans-serif",
                color: "white",
                textAlign: "center",

                paddingTop: "250px",
                paddingLeft: "20px",
                paddingRight: "20px",
                boxSizing: "border-box",
            }}
        >
            {/* HEADER */}
            <h1 style={{
                fontSize: "50px",
                marginBottom: "5px",
                color: "#ffffff",
                letterSpacing: "1px"
            }}>
                Smart Locker System
            </h1>
            <h3
                style={{
                fontSize: "38px",
                marginBottom: "25px",
                color: "#ffffff",
                letterSpacing: "1px"}}>
                Smart Storage. Zero Hassle.
            </h3>

            {/* CONTENT */}
            <div style={{ maxWidth: "600px" }}>
                <p style={{
                    fontSize: "18px",
                    marginBottom: "25px",
                    lineHeight: "1.6"
                }}>
                    Store and collect your items anytime with our secure
                    smart locker system — fast, contactless, and always available
                    when you need it.
                </p>

                {user && (
                    <div style={{ marginBottom: "20px", fontSize: "14px" }}>
                        <p><strong>Тестовый пользователь:</strong></p>
                        <p>Имя: <strong>{user.name}</strong></p>
                        <p>Email: <strong>{user.email}</strong></p>
                        <p>Роль: <strong>{user.role}</strong></p>
                    </div>
                )}

                {/* BUTTONS */}
                <div style={{
                    display: "flex",
                    gap: "15px",
                    justifyContent: "center",
                    flexWrap: "wrap",
                    marginBottom: "20px"
                }}>
                    {user ? (
                        <Link to="/redirect-by-role" style={buttonStyle}>
                            Go to dashboard
                        </Link>
                    ) : (
                        <Link to={Paths.LOGIN} style={buttonStyle}>
                            Get started
                        </Link>
                    )}

                    <button
                        onClick={handleHealthCheck}
                        style={buttonStyle}
                        disabled={loading}
                    >
                        {loading ? 'Checking...' : 'Sync Health Check'}
                    </button>
                </div>

                {/* HEALTH */}
                {health && !loading && (
                    <div style={{
                        marginTop: "15px",
                        padding: "15px",
                        borderRadius: "10px",
                        background: "rgba(255,255,255,0.12)",
                        backdropFilter: "blur(4px)"
                    }}>
                        <p style={{ color: getStatusColor(), fontWeight: 'bold' }}>
                            Status: {health.status}
                        </p>

                        {health.time && <p>Time: {health.time}</p>}
                        {health.uptime && <p>Uptime: {health.uptime}s</p>}

                        {health.services?.database && (
                            <p>
                                DB: {health.services.database.status}
                                {health.services.database.latencyMs && (
                                    <> ({health.services.database.latencyMs} ms)</>
                                )}
                            </p>
                        )}

                        {health.message && <p>{health.message}</p>}
                    </div>
                )}
            </div>
        </div>
    );
}