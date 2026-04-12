import type {ReactNode} from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import {Paths} from "../../../config/paths/paths.ts";

type Props = {
    allowed: string[];
    children: ReactNode;
};

export function RoleGuard({ allowed, children }: Props): JSX.Element {
    const { user } = useAuth();

    if (!user) {
        return <Navigate to={Paths.LOGIN} />;
    }

    if (!allowed.includes(user.role)) {
        return <Navigate to={Paths.FORBIDDEN} />;
    }

    return <>{children}</>;
}