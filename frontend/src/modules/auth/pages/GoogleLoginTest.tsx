import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../../providers/AuthContext.ts";
import { ROLES } from "../../../config/roles/roles.ts";
import { GOOGLE_CLIENT_ID } from '../../../config/env/env.ts';
import {Paths} from "../../../config/paths/paths.ts";

type GoogleCredentialResponse = {
    credential: string;
    select_by?: string;
};

type GoogleWindow = {
    accounts: {
        id: {
            initialize: (config: {
                client_id: string;
                callback: (response: GoogleCredentialResponse) => void;
            }) => void;
            renderButton: (
                parent: HTMLElement | null,
                options: {
                    theme?: string;
                    size?: string;
                }
            ) => void;
        };
    };
};

declare global {
    interface Window {
        google?: GoogleWindow
    }
}


const GoogleLoginTest = () => {
    const { googleLogin } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleCredentialResponse = async (responseGoogle: GoogleCredentialResponse) => {
        const idToken = responseGoogle.credential;

        try {

            const loggedInUser = await googleLogin(idToken);
            if (loggedInUser.role === ROLES.ADMIN) {
                navigate(Paths.ADMIN, { replace: true });
            } else if (loggedInUser.role === ROLES.OPERATOR) {
                navigate(Paths.OPERATOR, { replace: true });
            } else if (loggedInUser.role === ROLES.USER) {
                navigate(Paths.USER, { replace: true });
            } else {
                navigate(Paths.FORBIDDEN, { replace: true });
            }

        } catch (error) {
            console.error("Google Login Error:", error);
            }
    };

    useEffect(() => {
        if (!window.google) {
            console.warn("Google SDK is not loaded yet.");
            return;
        }

        if (!GOOGLE_CLIENT_ID) {
            console.warn("VITE_GOOGLE_CLIENT_ID is missing in your .env file.");
            return;
        }

        const el = document.getElementById("googleButton");
        if (!el) return;

        window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleCredentialResponse,
        });

        window.google.accounts.id.renderButton(el, {
            theme: "outline",
            size: "large"
        });

    }, [googleLogin, navigate]);

    return <div id="googleButton" style={{ display: 'flex', justifyContent: 'center' }}></div>;
};

export default GoogleLoginTest;