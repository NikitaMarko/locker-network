import { Navigate } from 'react-router-dom';
import { useAuth } from '../../../app/providers/useAuth.ts';
import type { ReactNode } from "react";

interface ProtectedRouteProps {
    children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
    const { user, loading } = useAuth();

    if (loading) return <div>Loading...</div>;

    // const token = localStorage.getItem('access_token');

    if (!user
        // || !token
    ) {
        return <Navigate to="/login" replace />;
    }

    return children;
}
