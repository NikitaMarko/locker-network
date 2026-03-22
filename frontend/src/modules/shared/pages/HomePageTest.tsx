import { Link } from 'react-router-dom';
import { useAuth } from '../../../app/providers/useAuth';

export function HomePage() {
    const { user } = useAuth();

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            textAlign: 'center'
        }}>
            <h1>Smart Locker System</h1>
            <p>Добро пожаловать в систему управления умными ячейками.</p>

            {user && (
                <div style={{ marginTop: '15px', fontSize: '16px', color: '#444' }}>
                    <p><strong>Тестовый пользователь:</strong></p>
                    <p>Имя: <strong>{user.name}</strong></p>
                    <p>Email: <strong>{user.email}</strong></p>
                    <p>Роль: <strong>{user.role}</strong></p>
                </div>
            )}

            {user ? (
                <Link to="/redirect-by-role" style={{ marginTop: '20px', fontSize: '18px' }}>
                    Перейти в панель
                </Link>
            ) : (
                <Link to="/login" style={{ marginTop: '20px', fontSize: '18px' }}>
                    Войти
                </Link>
            )}
        </div>
    );
}
