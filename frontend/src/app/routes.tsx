import { HomePage } from '../modules/shared/pages/HomePage';
import { RedirectByRole } from '../modules/shared/pages/RedirectByRole';

import { Routes, Route } from 'react-router-dom';
import { LoginPage } from '../modules/auth/pages/LoginPage';
import { RegisterPage } from '../modules/auth/pages/RegisterPage';
import { UserDashboardPage } from '../modules/user/pages/UserDashboardPage';
import { LockerBookingPage } from '../modules/user/pages/LockerBookingPage';
import { OperatorDashboardPage } from '../modules/operator/pages/OperatorDashboardPage';
import { AdminDashboardPage } from '../modules/admin/pages/AdminDashboardPage';
import { UsersPage } from '../modules/admin/pages/UsersPage';
import { ErrorsPage } from '../modules/admin/pages/ErrorsPage';
import { ForbiddenPage } from '../modules/shared/pages/ForbiddenPage';

import { ProtectedRoute } from '../modules/shared/components/ProtectedRoute';
import { RoleGuard } from '../modules/shared/components/RoleGuard';
import { ROLES } from '../config/roles';

export function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/redirect-by-role" element={<RedirectByRole />} />


            {/* Публичные */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* ❗ Вот сюда добавляем 403 */}
            <Route path="/403" element={<ForbiddenPage />} />

            {/* USER */}
            <Route
                path="/user/dashboard"
                element={
                    <ProtectedRoute>
                        <RoleGuard allowed={[ROLES.USER]}>
                            <UserDashboardPage />
                        </RoleGuard>
                    </ProtectedRoute>
                }
            />

            <Route
                path="/user/booking"
                element={
                    <ProtectedRoute>
                        <RoleGuard allowed={[ROLES.USER]}>
                            <LockerBookingPage />
                        </RoleGuard>
                    </ProtectedRoute>
                }
            />

            {/* OPERATOR */}
            <Route
                path="/operator"
                element={
                    <ProtectedRoute>
                        <RoleGuard allowed={[ROLES.OPERATOR]}>
                            <OperatorDashboardPage />
                        </RoleGuard>
                    </ProtectedRoute>
                }
            />

            {/* ADMIN */}
            <Route
                path="/admin"
                element={
                    <ProtectedRoute>
                        <RoleGuard allowed={[ROLES.ADMIN]}>
                            <AdminDashboardPage />
                        </RoleGuard>
                    </ProtectedRoute>
                }
            />

            <Route
                path="/admin/users"
                element={
                    <ProtectedRoute>
                        <RoleGuard allowed={[ROLES.ADMIN]}>
                            <UsersPage />
                        </RoleGuard>
                    </ProtectedRoute>
                }
            />

            <Route
                path="/admin/errors"
                element={
                    <ProtectedRoute>
                        <RoleGuard allowed={[ROLES.ADMIN]}>
                            <ErrorsPage />
                        </RoleGuard>
                    </ProtectedRoute>
                }
            />

        </Routes>
    );
}
