import { Navigate } from "react-router-dom";
import { useAuth } from "../../../app/providers/useAuth";
import { ROLES } from "../../../config/roles";

export function RedirectByRole() {
    const { user, loading } = useAuth();

    if (loading) return <div>Загрузка...</div>;

    if (!user) return <Navigate to="/login" replace />;

    switch (user.role) {
        case ROLES.USER:
            return <Navigate to="/user/dashboard" replace />;
        case ROLES.OPERATOR:
            return <Navigate to="/operator" replace />;
        case ROLES.ADMIN:
            return <Navigate to="/admin" replace />;
        default:
            return <Navigate to="/403" replace />;
    }
}
