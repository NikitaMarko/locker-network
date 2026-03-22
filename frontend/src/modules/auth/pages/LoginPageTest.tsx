import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../app/providers/useAuth';

export function LoginPage() {
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
        <div style={{ maxWidth: 400, margin: '60px auto' }}>
            <h1>Вход</h1>

            <div style={{
                marginTop: '15px',
                padding: '10px 15px',
                background: '#f5f5f5',
                borderRadius: '8px',
                fontSize: '14px',
                color: '#444',
                border: '1px solid #ddd'
            }}>
                <p style={{ margin: 0 }}><strong>Тестовый пользователь:</strong></p>
                <p style={{ margin: 0 }}>Email: <strong>demo@example.com</strong></p>
                <p style={{ margin: 0 }}>Пароль: <strong>123456</strong></p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                />

                <input
                    type="password"
                    placeholder="Пароль"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                />

                {error && <div style={{ color: 'red' }}>{error}</div>}

                <button type="submit" disabled={loading}>
                    {loading ? 'Вход...' : 'Войти'}
                </button>
            </form>
        </div>

    );
}
