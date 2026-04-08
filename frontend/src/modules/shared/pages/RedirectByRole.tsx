import { Navigate } from "react-router-dom";
import { useAuth } from "../../../app/providers/useAuth";
import { ROLES } from "../../../config/roles";

export function RedirectByRole() {
    const { user, loading } = useAuth();

    if (loading) return <div>Загрузка...</div>;

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (user.role === ROLES.USER) {
        return <Navigate to="/user/dashboard" replace />;
    }

    if (user.role === ROLES.OPERATOR) {
        return <Navigate to="/operator" replace />;
    }

    if (user.role === ROLES.ADMIN) {
        return <Navigate to="/admin" replace />;
    }

    return <Navigate to="/403" replace />;
}