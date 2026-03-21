import { Navigate } from 'react-router-dom';
import { useAuth } from '../../../app/providers/useAuth';
import type { ReactNode } from "react";

interface RoleGuardProps {
    allowed: string[];
    children: ReactNode;
}

export function RoleGuard({ allowed, children }: RoleGuardProps) {
    const { user, loading } = useAuth();

    if (loading) return <div>Loading...</div>;

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (!allowed.includes(user.role)) {
        return <Navigate to="/403" replace />;
    }

    return children;
}
