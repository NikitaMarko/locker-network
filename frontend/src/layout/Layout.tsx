import { Outlet } from 'react-router-dom';
import Navbar from './Navbar.tsx';

export const Layout = () => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%' }}>

            <Navbar />

            <main style={{ flex: 1, margin: 0, padding: 0 }}>
                <Outlet />
            </main>
        </div>
    );
};