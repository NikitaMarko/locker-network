import {useContext, useEffect} from "react";
import {AuthContext} from "../app/providers/AuthContext.ts";


type GoogleCredentialResponse = {
    credential: string;
    select_by?: string;
};

type GoogleWindow= {
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


// расширяем тип window и не было ошибок при компиляции
declare global {
    interface Window {
        google?:GoogleWindow
    }
}


const GoogleLoginTest = () => {

    const {googleLogin} = useContext(AuthContext)

    const handleCredentialResponse = async (responseGoogle: GoogleCredentialResponse) => {
        // {
        //   googleId: string,
        //   email: string,
        //   name: string,
        //   avatar: string,
        // }
        const idToken = responseGoogle.credential;
        await googleLogin(idToken);

    };

    useEffect(() => {
        if (!window.google) return;

        window.google.accounts.id.initialize({
            // id из акк
            client_id: " ",
            callback: handleCredentialResponse,
        });

        window.google.accounts.id.renderButton(
            document.getElementById("googleButton"),
            { theme: "outline", size: "large" }
        );
    }, []);

    return <div id="googleButton"></div>;
};

export default GoogleLoginTest;
