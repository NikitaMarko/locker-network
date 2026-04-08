import { useEffect, useContext, useCallback, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../app/providers/AuthContext.ts";
import { GOOGLE_CLIENT_ID } from "../config/env";

type GoogleCredentialResponse = {
    credential: string;
};

declare global {
    interface Window {
        google?: any;
    }
}

const GoogleLoginTest = () => {
    const { googleLogin } = useContext(AuthContext);
    const navigate = useNavigate();

    const [sdkLoaded, setSdkLoaded] = useState(false);
    const initialized = useRef(false);

    const handleCredentialResponse = useCallback(
        async (response: GoogleCredentialResponse) => {
            console.log("GOOGLE CALLBACK FIRED:", response);

            if (!response?.credential) return;

            try {
                await googleLogin(response.credential);

                console.log("LOGIN SUCCESS → REDIRECT");

                // ✅ ВАЖНО: даём React обновить state
                setTimeout(() => {
                    navigate("/redirect-by-role");
                }, 0);

            } catch (e) {
                console.error("GOOGLE LOGIN ERROR:", e);
            }
        },
        [googleLogin, navigate]
    );

    // загрузка SDK
    useEffect(() => {
        if (window.google) {
            setSdkLoaded(true);
            return;
        }

        const script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;

        script.onload = () => {
            console.log("Google SDK loaded");
            setSdkLoaded(true);
        };

        document.body.appendChild(script);
    }, []);

    // init ТОЛЬКО 1 раз
    useEffect(() => {
        if (!sdkLoaded || !window.google) return;
        if (initialized.current) return;

        initialized.current = true;

        console.log("GOOGLE INIT");

        const el = document.getElementById("googleButton");
        if (!el) return;

        window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleCredentialResponse,
            ux_mode: "popup",
        });

        window.google.accounts.id.renderButton(el, {
            theme: "outline",
            size: "large",
        });

    }, [sdkLoaded, handleCredentialResponse]);

    return <div id="googleButton"></div>;
};

export default GoogleLoginTest;