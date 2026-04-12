import type {ReactNode} from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import {Paths} from "../../../config/paths/paths.ts";

type Props = {
    children: ReactNode;
};

export function ProtectedRoute({ children }: Props): JSX.Element {
    const { user } = useAuth();


    if (!user) {
        return <Navigate to={Paths.LOGIN} />;
    }


    return <>{children}</>;
}