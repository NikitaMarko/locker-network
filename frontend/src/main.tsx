import { createRoot } from 'react-dom/client'
import './index.css'
import {App} from './App.tsx'
import {GoogleOAuthProvider} from "@react-oauth/google";
import React from "react";

createRoot(document.getElementById('root')!).render(

        <React.StrictMode>
            <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
                <App />
            </GoogleOAuthProvider>
        </React.StrictMode>

)
