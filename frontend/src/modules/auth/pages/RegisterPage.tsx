import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../app/providers/useAuth';
import { Paths } from "./../../../app/utils/paths.ts";
import GoogleLoginTest from "../../../components/GoogleLoginTest.tsx";

export function RegisterPage() {
    const navigate = useNavigate();
    const { register } = useAuth();

    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const user = await register(email, password, name);

            if (user.role === 'USER') navigate('/user/dashboard');
            if (user.role === 'OPERATOR') navigate('/operator/dashboard');
            if (user.role === 'ADMIN') navigate('/admin/dashboard');
        } catch {
            setError('Registration failed');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div style={wrapperStyle}>
            <div style={cardStyle}>
                <h1 style={titleStyle}>Sign up</h1>

                <form onSubmit={handleSubmit} style={formStyle}>
                    <input
                        type="text"
                        placeholder="Name"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        required
                        disabled={loading}
                        style={inputStyle}
                    />

                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                        disabled={loading}
                        style={inputStyle}
                    />

                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                        disabled={loading}
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
                        {loading ? 'Creating...' : 'Create account'}
                    </button>
                </form>

                <div style={footerTextStyle}>
                    Already have an account?
                </div>

                <GoogleLoginTest />

                <Link to={Paths.LOGIN} style={linkStyle}>
                    Login
                </Link>
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
    marginBottom: "80px",
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
    textAlign: "center" as const,
};

const footerTextStyle = {
    marginTop: "15px",
    textAlign: "center" as const,
    fontSize: "14px",
};

const linkStyle = {
    display: "block",
    textAlign: "center" as const,
    marginTop: "5px",
    color: "#4CAF50",
    textDecoration: "none",
    fontWeight: "bold",
};
