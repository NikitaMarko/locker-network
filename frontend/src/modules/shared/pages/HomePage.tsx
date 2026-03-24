import { Link } from 'react-router-dom';
import { useAuth } from '../../../app/providers/useAuth';
import { useState } from 'react';

export function HomePage() {
    const { user } = useAuth();

    const [health, setHealth] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const handleHealthCheck = async () => {
        try {
            setLoading(true);

            const res = await fetch('http://localhost:3555/health');
            const data = await res.json();

            setHealth(data);
        } catch (e) {
            setHealth({
                status: 'error',
                message: 'Network error',
            });
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = () => {
        if (!health) return 'black';
        if (health.status === 'ok') return 'green';
        if (health.status === 'degraded') return 'orange';
        return 'red';
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            textAlign: 'center',
            gap: '16px'
        }}>
            <h1>Smart Locker System</h1>
            <p>Добро пожаловать в систему управления умными ячейками.</p>

            {/* AUTH NAV */}
            {user ? (
                <Link to="/redirect-by-role" style={{ fontSize: '18px' }}>
                    Перейти в панель
                </Link>
            ) : (
                <Link to="/login" style={{ fontSize: '18px' }}>
                    Войти
                </Link>
            )}

            {/* 🔥 HEALTH BUTTON */}
            <button onClick={handleHealthCheck}>
                Sync Health Check
            </button>

            {/* LOADING */}
            {loading && <p>Checking system...</p>}

            {/* RESULT */}
            {health && !loading && (
                <div style={{
                    marginTop: '10px',
                    padding: '10px',
                    border: '1px solid #ccc',
                    borderRadius: '8px',
                    minWidth: '250px'
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
                            {health.services.database.error && (
                                <> - {health.services.database.error}</>
                            )}
                        </p>
                    )}

                    {health.message && <p>{health.message}</p>}
                </div>
            )}
        </div>
    );
}