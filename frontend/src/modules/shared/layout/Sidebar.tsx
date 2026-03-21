// src/modules/shared/layout/Sidebar.tsx
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../../app/providers/AuthProvider';
import { menuByRole } from './menu';

export function Sidebar() {
    const { user } = useAuth();

    if (!user) return null;

    const menu = menuByRole[user.role] || [];

    return (
        <aside style={{
            width: '220px',
            background: '#f5f5f5',
            padding: '20px',
            borderRight: '1px solid #ddd',
            height: '100vh',
            boxSizing: 'border-box'
        }}>
            <h3 style={{ marginBottom: '20px' }}>Меню</h3>

            <nav style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {menu.map(item => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        style={({ isActive }) => ({
                            padding: '10px',
                            borderRadius: '6px',
                            textDecoration: 'none',
                            color: isActive ? '#fff' : '#333',
                            background: isActive ? '#007bff' : 'transparent'
                        })}
                    >
                        {item.label}
                    </NavLink>
                ))}
            </nav>
        </aside>
    );
}
