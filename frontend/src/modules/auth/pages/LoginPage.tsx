import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
    Box, Paper, Typography, TextField, Button, Alert, Link, Divider,
    InputAdornment, IconButton
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import axios from 'axios';

import { useAuth } from '../../../hooks/useAuth';
import { Paths } from "../../../config/paths/paths.ts";
import GoogleLoginTest from "./GoogleLoginTest.tsx";
import { ROLES } from "../../../config/roles/roles.ts";

export function LoginPage() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {

            const loggedInUser = await login(email, password);
            if (loggedInUser.role === ROLES.ADMIN) {
                navigate(Paths.ADMIN, { replace: true });
            } else if (loggedInUser.role === ROLES.OPERATOR) {
                navigate(Paths.OPERATOR, { replace: true });
            } else if (loggedInUser.role === ROLES.USER) {
                navigate(Paths.USER, { replace: true });
            } else {
                navigate(Paths.FORBIDDEN, { replace: true });
            }

        } catch (error: unknown) {
            if (error instanceof Error && error.name === "BLOCK_TIME") {
                setError(error.message);
                return;
            }
            if (axios.isAxiosError(error)) {
                setError(error.response?.data?.message || "Wrong email or password");
                return;
            }
            setError("Unexpected error occurred");
        } finally {
            setLoading(false);
        }
    }

    return (
        <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f8fafc', p: 2 }}>
            <Paper elevation={0} sx={{ p: { xs: 4, md: 5 }, width: '100%', maxWidth: 450, borderRadius: 4, border: '1px solid #e2e8f0' }}>
                <Typography variant="h4" fontWeight={800} textAlign="center" mb={4} color="#1e293b">
                    Welcome to Smart Locker App!
                </Typography>

                <form onSubmit={handleSubmit}>
                    <Box display="flex" flexDirection="column" gap={2.5}>
                        <TextField
                            label="Email address"
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                            fullWidth
                        />
                        <TextField
                            label="Password"
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                            fullWidth
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={() => setShowPassword(!showPassword)}
                                            edge="end"
                                        >
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }}
                        />

                        {error && <Alert severity="error">{error}</Alert>}

                        <Button
                            type="submit"
                            variant="contained"
                            disabled={loading}
                            size="large"
                            sx={{ mt: 1, bgcolor: '#6baf5c', fontWeight: 'bold', '&:hover': { bgcolor: '#5a994c' } }}
                        >
                            {loading ? 'Logging in...' : 'Login'}
                        </Button>
                    </Box>
                </form>

                <Divider sx={{ my: 3 }}>
                    <Typography variant="body2" color="text.secondary">OR</Typography>
                </Divider>

                <Box display="flex" justifyContent="center" mb={3}>
                    <GoogleLoginTest />
                </Box>

                <Typography textAlign="center" variant="body2" color="text.secondary">
                    Don't have an account?{' '}
                    <Link component={RouterLink} to={Paths.REGISTER} sx={{ color: '#6baf5c', fontWeight: 'bold', textDecoration: 'none' }}>
                        Sign up
                    </Link>
                </Typography>
            </Paper>
        </Box>
    );
}