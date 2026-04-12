import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './providers/AuthProvider.tsx';
import { QueryProvider } from './providers/QueryProvider';
import { ThemeProvider } from './providers/ThemeProvider';
import { AppRoutes } from './routes/routes.tsx';

export function App() {
    return (
        <BrowserRouter>
            <ThemeProvider>
                <QueryProvider>
                    <AuthProvider>
                        <AppRoutes />
                    </AuthProvider>
                </QueryProvider>
            </ThemeProvider>
        </BrowserRouter>
    );
}

