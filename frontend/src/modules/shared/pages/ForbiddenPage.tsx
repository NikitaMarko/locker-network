import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Button, Container, Paper, Stack } from "@mui/material";
import LockOpenIcon from '@mui/icons-material/LockOpen';
import {Paths} from "../../../config/paths/paths.ts";

const BRAND_GREEN = '#6baf5c';

export function ForbiddenPage() {
    const navigate = useNavigate();
    const [seconds, setSeconds] = useState(5);

    useEffect(() => {

        const timer = setInterval(() => {
            setSeconds((prev) => prev - 1);
        }, 1000);


        const redirect = setTimeout(() => {
            navigate(Paths.LOGIN);
        }, 5000);

        return () => {
            clearInterval(timer);
            clearTimeout(redirect);
        };
    }, [navigate]);

    return (
        <Container maxWidth="sm">
            <Box
                sx={{
                    height: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                <Paper
                    sx={{
                        p: 6,
                        textAlign: 'center',
                        borderRadius: 1,
                        boxShadow: '0 10px 40px rgba(0,0,0,0.06)',
                        border: '1px solid #f0f0f0',
                        width: '100%'
                    }}
                >
                    <Stack spacing={3} alignItems="center">

                        <Box sx={{
                            bgcolor: 'rgba(107, 175, 92, 0.1)',
                            p: 2,
                            borderRadius: '50%',
                            display: 'inline-flex'
                        }}>
                            <LockOpenIcon sx={{ fontSize: 48, color: BRAND_GREEN }} />
                        </Box>

                        <Box>
                            <Typography variant="h3" fontWeight={900} sx={{ letterSpacing: '-0.02em', mb: 1 }}>
                                403
                            </Typography>
                            <Typography variant="h5" fontWeight={700} gutterBottom>
                                Access Denied
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                You don't have permission to access this page.
                            </Typography>
                        </Box>

                        <Box sx={{ py: 2 }}>
                            <Typography variant="body2" sx={{ bgcolor: '#f8fafc', px: 2, py: 1, borderRadius: 0.5, fontWeight: 600 }}>
                                Redirecting to Login in <span style={{ color: BRAND_GREEN }}>{seconds}s</span>...
                            </Typography>
                        </Box>

                        <Button
                            variant="contained"
                            fullWidth
                            onClick={() => navigate(Paths.LOGIN)}
                            sx={{
                                bgcolor: BRAND_GREEN,
                                borderRadius: 0.5,
                                py: 1.5,
                                fontWeight: 800,
                                textTransform: 'none',
                                boxShadow: 'none',
                                '&:hover': {
                                    bgcolor: '#5a994c',
                                    boxShadow: 'none'
                                }
                            }}
                        >
                            Go to Login Now
                        </Button>
                    </Stack>
                </Paper>
            </Box>
        </Container>
    );
}