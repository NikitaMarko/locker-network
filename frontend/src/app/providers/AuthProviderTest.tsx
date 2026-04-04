// // src/app/providers/AuthProvider.tsx
//
// import { useState } from "react";
// import type { ReactNode } from "react";
// import type { User } from "../../modules/shared/types/user";
// import { AuthContext } from "./AuthContext";
//
// interface AuthProviderProps {
//     children: ReactNode;
// }
//
// export function AuthProvider({ children }: AuthProviderProps) {
//
//     // Временный пользователь для разработки
//     const fakeUser: User = {
//         userId: "demo-1",
//         email: "demo@example.com",
//         name: "Demo User",
//         role: "USER",
//         phone: "+1234567890",
//     };
//
//     // Начальное состояние — пользователь авторизован
//     const [user, setUser] = useState<User | null>(fakeUser);
//
//     // Пока backend не подключён — загрузки нет
//     const loading = false;
//
//
//
//     // 🔹 login возвращает User
//     const login = async (): Promise<User> => {
//         // ВРЕМЕННЫЙ ЛОГИН
//         setUser(fakeUser);
//         return fakeUser;
//
//
//     };
//
//     // register возвращает User
//     const register = async (): Promise<User> => {
//         // ВРЕМЕННАЯ РЕГИСТРАЦИЯ
//         setUser(fakeUser);
//         return fakeUser;
//
//
//     };
//
//     const logout = () => {
//         localStorage.removeItem("access_token");
//         setUser(null);
//         window.location.href = "/login";
//     };
//
//     return (
//         <AuthContext.Provider value={{ user, loading, login, register, logout }}>
//             {children}
//         </AuthContext.Provider>
//     );
// }
