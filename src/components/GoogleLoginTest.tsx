import { useEffect, useContext, useCallback, useState } from "react";
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
    const [sdkLoaded, setSdkLoaded] = useState(false);

    const handleCredentialResponse = useCallback(
        async (response: GoogleCredentialResponse) => {
            console.log("GOOGLE CALLBACK FIRED:", response);

            if (!response?.credential) {
                console.log("NO CREDENTIAL");
                return;
            }

            try {
                console.log("SENDING TOKEN TO BACKEND...");
                await googleLogin(response.credential);

                console.log("LOGIN SUCCESS → REDIRECT");
                window.location.href = "/redirect-by-role";

            } catch (e) {
                console.error("GOOGLE LOGIN ERROR:", e);
            }
        },
        [googleLogin]
    );

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

    useEffect(() => {
        if (!sdkLoaded || !window.google) return;

        console.log("GOOGLE INIT");

        const el = document.getElementById("googleButton");
        if (!el) return;

        window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleCredentialResponse,
            ux_mode: "popup"
        });

        window.google.accounts.id.renderButton(el, {
            theme: "outline",
            size: "large"
        });

    }, [sdkLoaded, handleCredentialResponse]);

    return <div id="googleButton"></div>;
};

export default GoogleLoginTest;