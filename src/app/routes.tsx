import { Routes, Route, Outlet } from "react-router-dom";

import { HomePage } from "../modules/shared/pages/HomePage";
import { RedirectByRole } from "../modules/shared/pages/RedirectByRole";

import { LoginPageTest } from "../modules/auth/pages/LoginPageTest";
import { RegisterPage } from "../modules/auth/pages/RegisterPage";

import { UserDashboardPage } from "../modules/user/pages/UserDashboardPage";
import { LockerBookingPage } from "../modules/user/pages/LockerBookingPage";

import { OperatorDashboardPage } from "../modules/operator/pages/OperatorDashboardPage";

import { AdminDashboardPage } from "../modules/admin/pages/AdminDashboardPage";
import { UsersPage } from "../modules/admin/pages/UsersPage";
import { ErrorsPage } from "../modules/admin/pages/ErrorsPage";

import { ForbiddenPage } from "../modules/shared/pages/ForbiddenPage";

import { ProtectedRoute } from "../modules/shared/components/ProtectedRoute";
import { RoleGuard } from "../modules/shared/components/RoleGuard";
import { ROLES } from "../config/roles";

import Navbar from "./Navbar";
import { Info } from "../components/Info";
import { Pricing } from "../components/Price";
import { Location } from "../components/Location";


// -------------------------
// LAYOUTS
// -------------------------

function AuthLayout() {
    // Лэйаут для страниц авторизации — БЕЗ Navbar
    return (
        <div style={{ paddingTop: "40px" }}>
            <Outlet />
        </div>
    );
}

function MainLayout() {
    // Лэйаут для всех остальных страниц — С Navbar
    return (
        <>
            <Navbar />
            <Outlet />
        </>
    );
}


// -------------------------
// ROUTES
// -------------------------

export function AppRoutes() {
    return (
        <Routes>

            {/* ---------- AUTH LAYOUT (без Navbar) ---------- */}
            <Route element={<AuthLayout />}>
                <Route path="/login" element={<LoginPageTest />} />
                <Route path="/register" element={<RegisterPage />} />
            </Route>

            {/* ---------- MAIN LAYOUT (с Navbar) ---------- */}
            <Route element={<MainLayout />}>

                {/* Публичные */}
                <Route path="/" element={<HomePage />} />
                <Route path="/info" element={<Info />} />
                <Route path="/price" element={<Pricing />} />
                <Route path="/location" element={<Location />} />

                <Route path="/redirect-by-role" element={<RedirectByRole />} />
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
            </Route>

        </Routes>
    );
}
