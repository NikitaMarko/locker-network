import {useAuth} from "../../../app/providers/useAuth.ts";


export function Header() {
    const { user, logout } = useAuth();

    return (
        <header
            style={{
                height: 60,
                background: '#222',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 20px',
            }}
        >
            <div>SmartLocker Control System</div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <span>{user?.email}</span>
                <button onClick={logout}>Выйти</button>
            </div>
        </header>
    );
}
