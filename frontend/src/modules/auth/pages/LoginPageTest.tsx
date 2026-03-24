import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../app/providers/useAuth';

export function LoginPageTest() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(email, password);
            navigate('/redirect-by-role');
        } catch {
            setError('Неверный email или пароль');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div style={wrapperStyle}>
            <div style={cardStyle}>
                <h1 style={titleStyle}>Login</h1>

                {/* TEST USER */}
                <div style={infoStyle}>
                    <p><strong>Тестовый пользователь:</strong></p>
                    <p>Email: <strong>demo@example.com</strong></p>
                    <p>Password: <strong>123456</strong></p>
                </div>

                <form onSubmit={handleSubmit} style={formStyle}>
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                        style={inputStyle}
                    />

                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                        style={inputStyle}
                    />

                    {error && (
                        <div style={errorStyle}>
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        style={buttonStyle}
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>
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

const cardStyle = {
    width: "100%",
    maxWidth: "400px",
    padding: "30px",
    borderRadius: "12px",
    backgroundColor: "white",
    boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
};

const titleStyle = {
    textAlign: "center" as const,
    marginBottom: "20px",
};

const infoStyle = {
    marginBottom: "20px",
    padding: "10px 15px",
    background: "#f1f3f5",
    borderRadius: "8px",
    fontSize: "14px",
};

const formStyle = {
    display: "flex",
    flexDirection: "column" as const,
    gap: "12px",
};

const inputStyle = {
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    fontSize: "14px",
};

const buttonStyle = {
    padding: "12px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#4CAF50",
    color: "white",
    fontWeight: "bold",
    cursor: "pointer",
};

const errorStyle = {
    color: "#e53935",
    fontSize: "14px",
};