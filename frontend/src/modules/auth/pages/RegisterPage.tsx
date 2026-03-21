import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../app/providers/useAuth';

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
            setError('Ошибка регистрации');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div style={{ maxWidth: 400, margin: '60px auto' }}>
            <h1>Регистрация</h1>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <input
                    type="text"
                    placeholder="Имя"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                />

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
                    {loading ? 'Создание...' : 'Создать аккаунт'}
                </button>
            </form>
        </div>
    );
}
