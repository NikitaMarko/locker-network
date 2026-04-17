import { ThemeProvider as MuiThemeProvider, createTheme } from "@mui/material";
import CssBaseline from "@mui/material/CssBaseline";
import type {ReactNode} from "react";

const lightTheme = createTheme({
    palette: {
        mode: "light",
        background: {
            default: "#f5f6fa",
            paper: "#ffffff",
        },
        primary: {
            main: "#6baf5c",
            contrastText: "#ffffff",
        },
        text: {
            primary: "#111827",
            secondary: "#6b7280",
        },
    },

    shape: {
        borderRadius: 12,
    },

    typography: {
        fontFamily: "Inter, sans-serif",
    },
});

export function ThemeProvider({ children }: { children: ReactNode }) {
    return (
        <MuiThemeProvider theme={lightTheme}>
            <CssBaseline />
            {children}
        </MuiThemeProvider>
    );
}