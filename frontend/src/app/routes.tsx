import { HomePageTest } from '../modules/shared/pages/HomePageTest';
import { RedirectByRole } from '../modules/shared/pages/RedirectByRole';

import { Routes, Route } from 'react-router-dom';
import { LoginPageTest } from '../modules/auth/pages/LoginPageTest';
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
import Navbar from "./Navbar.tsx";
import {Info} from "../components/Info.tsx";
import {Pricing} from "../components/Price.tsx";
import {Location} from "../components/Location.tsx";

export function AppRoutes() {
    return (
        <>
            <Navbar />

            <Routes>
                <Route path="/" element={<HomePageTest />} />
                <Route path="/redirect-by-role" element={<RedirectByRole />} />

                {/* Публичные */}
                <Route path="/login" element={<LoginPageTest />} />
                <Route path="/info" element={<Info />} />
                <Route path="/price" element={<Pricing />} />
                <Route path="/location" element={<Location />} />
                <Route path="/register" element={<RegisterPage />} />

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
        </>
    );
}